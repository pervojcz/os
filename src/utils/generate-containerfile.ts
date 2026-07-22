export function generateContainerfile(
  baseImage: string,
  variantName: string,
  taskNames: string[],
  imageRegistry?: string,
) {
  const scriptRoot = "/usr/lib/os-script";
  const taskBlocks = taskNames
    .map(
      (taskName) => `# Task: ${taskName}
RUN set -ouex pipefail; \\
    mkdir -p /var/lib/alternatives; \\
    bun ${scriptRoot}/src/run-task.ts ${variantName} ${taskName}; \\
    ostree container commit;`,
    )
    .join("\n\n");

  const trustLayer = imageRegistry
    ? `
COPY cosign.pub /etc/pki/containers/os.pub
RUN set -ouex pipefail; \\
    mkdir -p /etc/containers/registries.d; \\
    jq --arg registry ${JSON.stringify(imageRegistry)} --arg keyPath "/etc/pki/containers/os.pub" \\
      '.transports.docker[$registry] = [{"type":"sigstoreSigned","keyPath":$keyPath,"signedIdentity":{"type":"matchRepository"}}]' \\
      /etc/containers/policy.json > /tmp/policy.json; \\
    mv /tmp/policy.json /etc/containers/policy.json; \\
    printf '%s\\n' \\
      'docker:' \\
      '  ${imageRegistry}:' \\
      '    use-sigstore-attachments: true' \\
      > /etc/containers/registries.d/os.yaml; \\
    ostree container commit;
`
    : "";

  return `FROM ${baseImage}

COPY . ${scriptRoot}
RUN set -ouex pipefail; \\
    chmod +x ${scriptRoot}/src/install-bun.sh; \\
    ${scriptRoot}/src/install-bun.sh; \\
    (cd ${scriptRoot}; bun install); \\
    ostree container commit;

${taskBlocks}

RUN set -ouex pipefail; \\
    rm -rf ${scriptRoot}; \\
    ostree container commit;
${trustLayer}
## NOTES:
# - /var/lib/alternatives is required to prevent failure with some RPM installs
# - All RUN commands must end with ostree container commit
#   see: https://coreos.github.io/rpm-ostree/container/#using-ostree-container-commit
`;
}
