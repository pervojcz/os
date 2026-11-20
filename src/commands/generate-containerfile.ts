import type { VariantConfig } from "~/define-variant";
import {
  assertBootableImage,
  getBaseImageLabels,
  getImageVersions,
} from "~/utils/base-image-labels";
import { generateLabels } from "~/utils/generate-labels";
import variants from "../../variants/variants";

const osProjectName = "circle-os";
const imageNamePrefix = "os";

/*
 * # NOTES:
 * - /var/lib/alternatives is required to prevent failure with some RPM installs
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

  const outputLabels = generateLabels(variant);

  const baseImageLabels = await getBaseImageLabels(variant.baseImage);
  await assertBootableImage(variant.baseImage, baseImageLabels);
  const versions = await getImageVersions(variant.baseImage, baseImageLabels);

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
    getChunkahPart(chunkahOut, outputLabels, variant.maxLayers),
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

${getCosignKeyPart(imageRegistry)}

RUN bootc container lint
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

function getChunkahPart(
  outDir: string,
  labels: Record<string, string> = {},
  maxLayers = 128,
) {
  const labelArgs = Object.entries(labels)
    .map(([key, value]) => "--label " + [key, JSON.stringify(value)].join("="))
    .join(" ");

  return `
FROM quay.io/coreos/chunkah AS chunkah
ARG CHUNKAH_CONFIG_STR
RUN --mount=from=builder,src=/,target=/chunkah,ro \\
    --mount=type=bind,target=/run/src,rw \\
    chunkah build --prune /sysroot/ --max-layers ${maxLayers} \\
      --label ostree.commit- --label ostree.final-diffid- \\
      ${labelArgs} \\
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
    policy_path=/etc/containers/policy.json; \\
    if [ ! -e "$policy_path" ]; then policy_path=/usr/share/containers/policy.json; fi; \\
    jq --arg registry ${JSON.stringify(imageRegistry)} \\
      '.transports.docker[$registry] = ${JSON.stringify(registryPolicyTemplate)}' \\
      "$policy_path" > /tmp/policy.json; \\
    mv /tmp/policy.json "$policy_path"; \\
    printf '%s\\n' \\
      'docker:' \\
      '  ${imageRegistry}:' \\
      '    use-sigstore-attachments: true' \\
      > /etc/containers/registries.d/${osProjectName}.yaml;
`.trim();
}
