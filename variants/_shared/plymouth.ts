import { writeFile } from "node:fs/promises";
import tools from "~/tools";

export async function installPlymouth() {
  await tools.packages.installPackages("plymouth", "plymouth-system-theme");
  await tools.dracut.rebuildInitramfs();
  await writeFile(
    "/usr/lib/bootc/kargs.d/50-plymouth.toml",
    'kargs = ["rhgb", "quiet"]',
    "utf-8",
  );
}
