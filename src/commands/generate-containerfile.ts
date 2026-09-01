import type { VariantConfig } from "~/define-variant";
import { getGitHubVariables } from "~/utils/get-github-variables";
import { getImageKernelVersion } from "~/utils/image-kernel-version";
import variants from "../../variants/variants";

const osProjectName = "circle-os";

export async function generateContainerfile(
  variantName: string,
  imageRegistry?: string,
) {
  if (!(variantName in variants)) {
    console.error(`Variant ${variantName} not found`);
    process.exit(1);
  }

  const variant = variants[variantName as keyof typeof variants];

  await getImageKernelVersion(variant.baseImage).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });

  const osBuilderPath = "/tmp/osbuilder";

  const containerfile = `
FROM ${variant.baseImage}

${getLabels(variant)}

COPY ./dist/osbuilder ${osBuilderPath}
RUN set -ouex pipefail; \\
    mkdir -p /var/lib/alternatives; \\
    ${osBuilderPath} run-builder ${variantName}; \\
    rm -f ${osBuilderPath}; \\
    ostree container commit;

${getCosignKeyPart(imageRegistry)}

## NOTES:
# - /var/lib/alternatives is required to prevent failure with some RPM installs
# - All RUN commands must end with ostree container commit
#   see: https://coreos.github.io/rpm-ostree/container/#using-ostree-container-commit
`.trim();

  console.log(containerfile);
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

function getLabels(variant: VariantConfig) {
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
