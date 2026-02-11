export function generateContainerfile(
  variantName: string,
  taskNames: string[],
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

  return `ARG BASE_IMAGE
FROM quay.io/fedora-ostree-desktops/\${BASE_IMAGE}

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

## NOTES:
# - /var/lib/alternatives is required to prevent failure with some RPM installs
# - All RUN commands must end with ostree container commit
#   see: https://coreos.github.io/rpm-ostree/container/#using-ostree-container-commit
`;
}
