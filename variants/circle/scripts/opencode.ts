import { $ } from "bun";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function installOpencode(ctx: VariantCtx) {
  const assets = await ctx.getReleaseAssets("anomalyco/opencode");

  const cliAsset = assets.find(
    (a) => a.name === `opencode-linux-${ctx.architectureGeneral}.tar.gz`,
  );
  const desktopAsset = assets.find(
    (a) => a.name === `opencode-desktop-linux-${ctx.architecture}.rpm`,
  );
  if (!cliAsset || !desktopAsset) throw new Error("Opencode assets not found");

  // cli
  const tempDir = ctx.getTempDir("opencode", cliAsset.name);
  const cliFileName = join(tempDir, cliAsset.name);
  await ctx.downloadFile(cliAsset.url, cliFileName);
  await $`tar -xzf ${cliFileName} -C ${tempDir}`;
  await $`${tempDir}/opencode /usr/bin/opencode`;

  // desktop
  await ctx.installPackages(desktopAsset.url);
}
