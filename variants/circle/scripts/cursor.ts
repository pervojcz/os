import { $ } from "bun";
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

  await $`${downloadPath} --appimage-extract`.cwd(workdir);
  const extractedPath = join(workdir, "squashfs-root");
  const appDirPath = join(extractedPath, "usr");

  await ctx.copyFiles(appDirPath, "/usr");
}
