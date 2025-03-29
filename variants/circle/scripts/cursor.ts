import { $ } from "bun";
import { rm, stat } from "fs/promises";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function installCursor(ctx: VariantCtx) {
  const url = "https://downloader.cursor.sh/linux/appImage/x64";
  const workdir = ctx.getTempDir("cursor", "appimage");
  const downloadPath = join(workdir, "cursor.AppImage");

  await ctx.downloadFile(url, downloadPath);
  await $`chmod +x ${downloadPath}`;

  await $`${downloadPath} --appimage-extract`;
  const extractedPath = join(workdir, "squashfs-root");

  const files = await ctx.listFiles(extractedPath);
  for (const file of files) {
    const stats = await stat(file);
    if (stats.isDirectory()) continue;
    await rm(file, { force: true });
  }

  await ctx.copyFiles(extractedPath);
}
