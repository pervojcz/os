import type { VariantConfig } from "~/define-variant";
import { getGitHubVariables } from "~/utils/get-github-variables";
import {
  assertBootableImage,
  getImageVersions,
  getLabels,
} from "~/utils/labels";
import variants from "../../variants/variants";

const osProjectName = "circle-os";
const imageNamePrefix = "os";

/*
 * # NOTES:
 * - /var/lib/alternatives is required to prevent failure with some RPM installs
 * - All RUN commands must end with ostree container commit
 *   see: https://coreos.github.io/rpm-ostree/container/#using-ostree-container-commit
 */

export async function generateContainerfile(args: {
  variant?: string;
  image_registry?: string;
  image_digest?: string;
  nvidia?: boolean;
}) {
  const variant = variants.get(args.variant);
  if (!variant) {
    console.error(`Variant ${args.variant} not found`);
    process.exit(1);
  }

  const imageLabels = await getLabels(variant.baseImage);
  await assertBootableImage(variant.baseImage, imageLabels);
  const versions = await getImageVersions(variant.baseImage, imageLabels);

  // unique per image so main + nvidia builds in the same workspace don't collide
  const chunkahOut = args.nvidia
    ? `out-${variant.name}-nvidia`
    : `out-${variant.name}`;

  const containerfile = [
    getOsBuilderPart(),
    args.nvidia
      ? getNvidiaDriversPart(
          variant,
          args.image_registry,
          args.image_digest,
          versions.image,
        )
      : getMainImagePart(variant, args.image_registry),
    getChunkahPart(chunkahOut),
    getLabelsPart(variant),
  ].join("\n\n");

  console.log(containerfile);
}

function getOsBuilderPart() {
  return `
FROM scratch AS ctx
COPY ./dist /
`.trim();
}

function getMainImagePart(variant: VariantConfig, imageRegistry?: string) {
  return `
FROM ${variant.baseImage} AS builder

RUN --mount=type=bind,from=ctx,source=/,target=/ctx \\
    --mount=type=cache,target=/var/cache \\
    --mount=type=cache,target=/var/log \\
    --mount=type=tmpfs,target=/tmp \\
    set -ouex pipefail; \\
    mkdir -p /var/lib/alternatives; \\
    /ctx/osbuilder run-builder ${variant.name};

RUN bootc container lint

${getCosignKeyPart(imageRegistry)}
`.trim();
}

function getNvidiaDriversPart(
  variant: VariantConfig,
  imageRegistry?: string,
  imageDigest?: string,
  imageVersion?: string,
) {
  if (!imageRegistry || !imageDigest) {
    console.error(
      "Image registry and digest are required for NVIDIA drivers installation",
    );
    process.exit(1);
  }

  if (!imageVersion) {
    console.error("Base image needs to have a version label set");
    process.exit(1);
  }

  const majorVersion = imageVersion.split(".")[0];

  return `
FROM ghcr.io/ublue-os/akmods-nvidia-open:main-${majorVersion} AS nvidia-akmods
FROM ${imageRegistry}/${imageNamePrefix}-${variant.name}@${imageDigest} AS builder

RUN --mount=type=bind,from=ctx,source=/,target=/ctx \\
    --mount=type=cache,target=/var/cache \\
    --mount=type=cache,target=/var/log \\
    --mount=type=tmpfs,target=/tmp \\
    --mount=type=bind,from=nvidia-akmods,source=/rpms,target=/tmp/akmods-rpms \\
    set -ouex pipefail; \\
    mkdir -p /var/lib/alternatives; \\
    /ctx/osbuilder --nvidia run-builder ${variant.name};

RUN bootc container lint
`.trim();
}

function getChunkahPart(outDir: string) {
  return `
FROM quay.io/coreos/chunkah AS chunkah
ARG CHUNKAH_CONFIG_STR
RUN --mount=from=builder,src=/,target=/chunkah,ro \\
    --mount=type=bind,target=/run/src,rw \\
    chunkah build --prune /sysroot/ --max-layers 128 \\
      --label ostree.commit- --label ostree.final-diffid- \\
      --output oci:/run/src/${outDir}

FROM oci:${outDir}
`.trim();
}

function getCosignKeyPart(imageRegistry?: string) {
  if (!imageRegistry) return "";

  const keyPath = `/etc/pki/containers/${osProjectName}.pub`;

  const registryPolicyTemplate = [
    {
      type: "sigstoreSigned",
      keyPaths: [keyPath],
      signedIdentity: { type: "matchRepository" },
    },
  ];

  return `
COPY ./cosign.pub ${keyPath}
RUN set -ouex pipefail; \\
    mkdir -p /etc/containers/registries.d; \\
    jq --arg registry ${JSON.stringify(imageRegistry)} \\
      '.transports.docker[$registry] = ${JSON.stringify(registryPolicyTemplate)}' \\
      /etc/containers/policy.json > /tmp/policy.json; \\
    mv /tmp/policy.json /etc/containers/policy.json; \\
    printf '%s\\n' \\
      'docker:' \\
      '  ${imageRegistry}:' \\
      '    use-sigstore-attachments: true' \\
      > /etc/containers/registries.d/${osProjectName}.yaml; \\
    ostree container commit;
`.trim();
}

function getLabelsPart(variant: VariantConfig) {
  const labels = new Map<string, string>();
  const gh = getGitHubVariables();

  if (variant.metadata?.title) {
    labels.set("org.opencontainers.image.title", variant.metadata.title);
  }

  if (variant.metadata?.description) {
    labels.set(
      "org.opencontainers.image.description",
      variant.metadata.description,
    );
  }

  if (gh.repo) {
    labels.set(
      "org.opencontainers.image.source",
      `https://github.com/${gh.repo}`,
    );

    const ref = gh.commitSha ?? gh.refName;
    const file = `variants/${variant.name}/README.md`;
    labels.set(
      "io.artifacthub.package.readme-url",
      `https://raw.githubusercontent.com/${gh.repo}/${ref}/${file}`,
    );
  }

  return Array.from(labels.entries())
    .map(([key, value]) => {
      return `LABEL ${JSON.stringify(key)}=${JSON.stringify(value)}`;
    })
    .join("\n");
}
