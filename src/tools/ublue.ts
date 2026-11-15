import { $ } from "bun";
import { exists } from "node:fs/promises";
import tools from ".";

export async function installNvidiaDrivers() {
  const script = "/tmp/akmods-rpms/ublue-os/nvidia-install.sh";
  if (!(await exists(script))) return false;

  const os = await tools.osrelease.readOsReleaseFile();
  const variant = os.get("VARIANT_ID") ?? os.get("ID") ?? "unknown";

  await $`${script}`.env({ ...process.env, IMAGE_NAME: variant });

  await tools.dracut.rebuildInitramfs();
}
