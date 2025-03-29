import { $ } from "bun";
import { rm, stat } from "fs/promises";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function installCursor(ctx: VariantCtx) {
  type Res = { downloadUrl: string; version: string };
  const res = await fetch(
    "https://www.cursor.com/api/download?platform=linux-x64&releaseTrack=stable"
  );
  const data = (await res.json()) as Res;

  const workdir = ctx.getTempDir("cursor", "appimage");
  const downloadPath = join(workdir, "cursor.AppImage");

  await ctx.downloadFile(data.downloadUrl, downloadPath);
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
