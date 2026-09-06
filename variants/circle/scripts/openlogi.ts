import { $ } from "bun";
import { join } from "node:path";
import tools from "~/tools";

export async function installOpenLogi() {
  const { architecture } = await tools.fedora.getFedoraInfo();

  const assets = await tools.github.getReleaseAssets("AprilNEA/OpenLogi");
  const rpm = assets.find((a) => a.name.endsWith(`${architecture.debian}.rpm`));
  if (!rpm) throw new Error("OpenLogi RPM asset not found");

  const tempDir = await tools.files.createTmpDir("openlogi", rpm.name);
  const rpmPath = join(tempDir, rpm.name);
  await tools.download.downloadFile(rpm.url, rpmPath);

  await $`rpm --install --noscripts ${rpmPath}`;
  await $`systemctl --global enable openlogi-agent`;
}
