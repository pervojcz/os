import { $ } from "bun";
import { join } from "node:path";
import tools from "~/tools";

export async function installOpenLogi() {
  const { architecture } = await tools.fedora.getFedoraInfo();

  const assets = await tools.github.getReleaseAssets("AprilNEA/OpenLogi");
  const rpm = assets.find((a) => a.name.endsWith(`${architecture.debian}.rpm`));
  if (!rpm) throw new Error("OpenLogi RPM asset not found");

  const tempDir = await tools.files.createTmpDir("openlogi", rpm.name);
  const archivePath = join(tempDir, rpm.name);
  await tools.download.downloadFile(rpm.url, archivePath);

  await tools.packages.installPackages(archivePath);
  await $`systemctl enable openlogi-agent`;
}
