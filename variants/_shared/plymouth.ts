import { $ } from "bun";
import tools from "~/tools";

export async function installPlymouth() {
  await tools.packages.installPackages("plymouth", "plymouth-system-theme");
  await $`echo 'kargs = ["rhgb", "quiet"]' > /usr/lib/bootc/kargs.d/50-plymouth.toml`;
  await tools.dracut.rebuildInitramfs();
}
