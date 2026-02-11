export function generateContainerfile(
  variantName: string,
  taskNames: string[],
) {
  const taskBlocks = taskNames
    .map(
      (taskName) => `# Task: ${taskName}
RUN set -ouex pipefail; \\
    bun /tmp/os-script/src/run-task.ts ${variantName} ${taskName}; \\
    ostree container commit;`,
    )
    .join("\n\n");

  return `ARG BASE_IMAGE
FROM quay.io/fedora-ostree-desktops/\${BASE_IMAGE}

COPY . /tmp/os-script
RUN set -ouex pipefail; \\
    chmod +x /tmp/os-script/src/install-bun.sh; \\
    /tmp/os-script/src/install-bun.sh; \\
    bun install; \\
    ostree container commit;

${taskBlocks}

## NOTES:
# - /var/lib/alternatives is required to prevent failure with some RPM installs
# - All RUN commands must end with ostree container commit
#   see: https://coreos.github.io/rpm-ostree/container/#using-ostree-container-commit
`;
}
