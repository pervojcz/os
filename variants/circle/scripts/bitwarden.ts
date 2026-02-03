import { $ } from "bun";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function installBitwarden(ctx: VariantCtx) {
  const releases = await ctx.listReleases("bitwarden/clients");
  const desktopReleases = releases.filter((r) => r.tag_name.startsWith("desktop-"));
  const latest = desktopReleases.at(0)?.tag_name;
  if (!latest) throw new Error("No Bitwarden desktop release found");

  const assets = await ctx.getReleaseAssets("bitwarden/clients", `tags/${latest}`);
  const rpm = assets.find((a) => a.name.endsWith(`-${ctx.architecture}.rpm`));
  if (!rpm) throw new Error("No Bitwarden desktop .rpm found");

  const tempDir = ctx.getTempDir("bitwarden", rpm.name);
  const rpmFile = join(tempDir, rpm.name);
  const extractedDir = join(tempDir, "output");

  await ctx.downloadFile(rpm.url, rpmFile);
  await $`rpm2cpio ${rpmFile} | cpio -idmv -D ${extractedDir}`.quiet();

  await $`mv ${extractedDir}/opt/Bitwarden ${extractedDir}/usr/share/bitwarden`;
  await $`rm -rf ${extractedDir}/opt`;

  await $`sed -i 's|/opt/Bitwarden/bitwarden|/usr/share/bitwarden/bitwarden|g' ${extractedDir}/usr/share/applications/bitwarden.desktop`;

  await ctx.copyFiles(extractedDir);
  await $`ln -s /usr/share/bitwarden/bitwarden /usr/bin/bitwarden`;
}
