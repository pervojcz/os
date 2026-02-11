export function generateContainerfile(taskNames: string[]) {
  const taskBlocks = taskNames
    .map(
      (taskName) => `# Task: ${taskName}
RUN set -ouex pipefail; \\
    VARIANT_NAME=\${VARIANT_NAME} TASK_NAME=${taskName} /tmp/os-script/src/run-script.sh; \\
    ostree container commit;`,
    )
    .join("\n\n");

  return `ARG BASE_IMAGE
FROM quay.io/fedora-ostree-desktops/\${BASE_IMAGE}

ARG VARIANT_NAME

COPY src/install-bun.sh /tmp/os-script/src/install-bun.sh
RUN set -ouex pipefail; \\
    chmod +x /tmp/os-script/src/install-bun.sh; \\
    /tmp/os-script/src/install-bun.sh; \\
    ostree container commit;

COPY . /tmp/os-script
RUN set -ouex pipefail; \\
    mkdir -p /var/lib/alternatives; \\
    chmod +x /tmp/os-script/src/run-script.sh; \\
    (cd /tmp/os-script; bun install); \\
    ostree container commit;

${taskBlocks}

## NOTES:
# - /var/lib/alternatives is required to prevent failure with some RPM installs
# - All RUN commands must end with ostree container commit
#   see: https://coreos.github.io/rpm-ostree/container/#using-ostree-container-commit
`;
}
