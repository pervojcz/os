import { $ } from "bun";
import { join } from "node:path";
import tools from ".";

export async function rebuildInitramfs() {
  const { kernelRelease: r } = await tools.fedora.getFedoraInfo();
  const initramfsPath = join("/usr/lib/modules", r, "initramfs.img");
  console.log("KERNEL RELEASE:", r, "INITRAMFS PATH:", initramfsPath);
  await $`dracut --no-hostonly --kver ${r} --force ${initramfsPath}`;
}
