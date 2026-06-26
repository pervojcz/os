import { $ } from "bun";
import { join } from "path";
import { createTaskGetter } from "~/utils/create-variant";

export const getOpencodeTask = createTaskGetter(async (ctx) => {
  const assets = await ctx.getReleaseAssets("anomalyco/opencode");

  const cliAsset = assets.find(
    (a) => a.name === `opencode-linux-${ctx.architectureGeneral}.tar.gz`,
  );
  if (!cliAsset) throw new Error("Opencode CLI asset not found");

  const tempDir = ctx.getTempDir("opencode", cliAsset.name);
  const archivePath = join(tempDir, cliAsset.name);
  await ctx.downloadFile(cliAsset.url, archivePath);
  await $`tar -xzf ${archivePath} -C ${tempDir}`;
  await $`install -Dm755 ${join(tempDir, "opencode")} /usr/bin/opencode`;
  await $`ln -sf /usr/bin/opencode /usr/bin/oc`;
});
