import { $ } from "bun";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function downloadFonts(ctx: VariantCtx) {
  await Promise.all([downloadGeist(ctx), downloadInter(ctx)]);
}

async function downloadGeist(ctx: VariantCtx) {
  const assets = await ctx.getLatestReleaseAssets("vercel/geist-font");
  for (const asset of assets) {
    const tempDir = ctx.getTempDir("fonts", asset.name);
    const fontFile = join(tempDir, asset.name);
    const outputDir = join(tempDir, "output");
    const fontDir = join(outputDir, asset.name.replace(".zip", ""), "ttf");

    await ctx.downloadFile(asset.url, fontFile);
    await $`unzip ${fontFile} -d ${outputDir}`.quiet();

    await ctx.copyFiles(fontDir, "/usr/share/fonts");
  }
}

async function downloadInter(ctx: VariantCtx) {
  const assets = await ctx.getLatestReleaseAssets("rsms/inter");
  for (const asset of assets) {
    const tempDir = ctx.getTempDir("fonts", asset.name);
    const fontFile = join(tempDir, asset.name);
    const outputDir = join(tempDir, "output");
    const fontDir = join(outputDir, "extras", "ttf");

    await ctx.downloadFile(asset.url, fontFile);
    await $`unzip ${fontFile} -d ${outputDir}`.quiet();

    await ctx.copyFiles(fontDir, "/usr/share/fonts");
  }
}
