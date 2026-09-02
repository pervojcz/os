import { $ } from "bun";
import tools from "~/tools";

export async function installLenovoLegionLinux() {
  const { fedoraVersion } = await tools.fedora.getFedoraInfo();
  await tools.oras.installRpmsFromOras(
    `ghcr.io/pervoj/lenovolegionlinux-rpms:f${fedoraVersion}`,
  );

  await $`cp -a /usr/share/legion_linux /etc/legion_linux`;
  await $`systemctl enable legiond`;
}
