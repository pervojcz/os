import { $ } from "bun";
import tools from "~/tools";

export async function installLenovoLegionLinux() {
  const { fedoraVersion } = await tools.fedora.getFedoraInfo();
  const tempDir = await tools.files.createTmpDir("lenovo-legion-linux");

  const ociUrl = `ghcr.io/pervoj/lenovolegionlinux-rpms:f${fedoraVersion}`;
  await $`oras pull ${ociUrl} -o ${tempDir}`;

  const rpms = await tools.files.list(tempDir, (f) => f.endsWith(".rpm"));
  console.log(`Installing ${rpms.length} LenovoLegionLinux RPMs`);

  await tools.packages.installPackages(...rpms);

  await $`cp -a /usr/share/legion_linux /etc/legion_linux`;
  await $`systemctl enable legiond`;
}
