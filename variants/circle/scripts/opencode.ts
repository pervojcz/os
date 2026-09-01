import { $ } from "bun";
import { join } from "path";
import tools from "~/tools";

export async function installOpencode() {
  const { architectureGeneral } = await tools.fedora.getFedoraInfo();
  const assets = await tools.github.getReleaseAssets("anomalyco/opencode");

  const cliAsset = assets.find(
    (a) => a.name === `opencode-linux-${architectureGeneral}.tar.gz`,
  );
  if (!cliAsset) throw new Error("Opencode CLI asset not found");

  const tempDir = await tools.files.createTmpDir("opencode", cliAsset.name);
  const archivePath = join(tempDir, cliAsset.name);
  await tools.download.downloadFile(cliAsset.url, archivePath);
  await $`tar -xzf ${archivePath} -C ${tempDir}`;
  await $`install -Dm755 ${join(tempDir, "opencode")} /usr/bin/opencode`;
  await $`ln -sf /usr/bin/opencode /usr/bin/oc`;
}
