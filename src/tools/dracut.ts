import { $ } from "bun";
import { join } from "node:path";
import tools from ".";

export async function rebuildInitramfs() {
  const { kernelRelease: r } = await tools.fedora.getFedoraInfo();
  const initramfsPath = join("/usr/lib/modules", r, "initramfs.img");

  await $`mkdir -p /var/roothome`;
  await $`dracut --no-hostonly --kver ${r} --reproducible -v --add ostree --strip --compress "zstd -19 -T0" -f ${initramfsPath}`.env(
    { ...process.env, DRACUT_NO_XATTR: "1" },
  );
  await $`chmod 0600 ${initramfsPath}`;
}
