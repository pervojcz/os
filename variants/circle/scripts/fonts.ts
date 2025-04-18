import { $ } from "bun";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

const fonts = "/usr/share/fonts";

export async function downloadFonts(ctx: VariantCtx) {
  await $`mkdir -p ${fonts}`;

  await Promise.all([
    downloadGeist(ctx),
    downloadInter(ctx),
    downloadKanit(ctx),
  ]);

  await $`fc-cache -v`;
}

async function downloadGeist(ctx: VariantCtx) {
  const assets = await ctx.getLatestReleaseAssets("vercel/geist-font");
  for (const asset of assets) {
    const fullFontName = asset.name.replace(".zip", "");
    const tempDir = ctx.getTempDir("fonts", asset.name);
    const fontFile = join(tempDir, asset.name);
    const outputDir = join(tempDir, "output");
    const fontDir = join(outputDir, fullFontName, "ttf");

    await ctx.downloadFile(asset.url, fontFile);
    await $`unzip ${fontFile} -d ${outputDir}`.quiet();

    await ctx.copyFiles(fontDir, fonts);
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

    await ctx.copyFiles(fontDir, fonts);
  }
}

async function downloadKanit(ctx: VariantCtx) {
  const repo = "cadsondemak/kanit";
  const url = `https://github.com/${repo}/archive/refs/heads/master.zip`;

  const tempDir = ctx.getTempDir("fonts", "kanit");
  const fontFile = join(tempDir, "kanit.zip");
  const outputDir = join(tempDir, "output");
  const fontDir = join(outputDir, "kanit-master", "fonts", "ttf");

  await ctx.downloadFile(url, fontFile);
  await $`unzip ${fontFile} -d ${outputDir}`.quiet();

  await ctx.copyFiles(fontDir, fonts);
}
