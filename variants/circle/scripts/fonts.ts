import { $ } from "bun";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function downloadFonts(ctx: VariantCtx) {
  await Promise.all([downloadGeist(ctx), downloadInter(ctx)]);
}

async function downloadGeist(ctx: VariantCtx) {
  const assets = await ctx.getLatestReleaseAssets("vercel/geist-font");
  for (const asset of assets) {
    const fullFontName = asset.name.replace(".zip", "");
    const fontName = fullFontName.split("-")[0];
    const tempDir = ctx.getTempDir("fonts", asset.name);
    const fontFile = join(tempDir, asset.name);
    const outputDir = join(tempDir, "output");
    const fontDir = join(outputDir, fullFontName, "ttf");

    await ctx.downloadFile(asset.url, fontFile);
    await $`unzip ${fontFile} -d ${outputDir}`.quiet();

    const installDir = join("/usr/share/fonts", fontName);
    await $`mkdir -p ${installDir}`;
    await ctx.copyFiles(fontDir, installDir);

    await $`fc-cache -f ${installDir}`.quiet();
  }
}

async function downloadInter(ctx: VariantCtx) {
  const assets = await ctx.getLatestReleaseAssets("rsms/inter");
  for (const asset of assets) {
    const fullFontName = asset.name.replace(".zip", "");
    const fontName = fullFontName.split("-")[0];
    const tempDir = ctx.getTempDir("fonts", asset.name);
    const fontFile = join(tempDir, asset.name);
    const outputDir = join(tempDir, "output");
    const fontDir = join(outputDir, "extras", "ttf");

    await ctx.downloadFile(asset.url, fontFile);
    await $`unzip ${fontFile} -d ${outputDir}`.quiet();

    const installDir = join("/usr/share/fonts", fontName);
    await $`mkdir -p ${installDir}`;
    await ctx.copyFiles(fontDir, installDir);

    await $`fc-cache -f ${installDir}`.quiet();
  }
}
