import { $ } from "bun";
import { join } from "path";
import { createTaskGetter } from "~/utils/create-variant";

export const getVicinaeTask = createTaskGetter(async (ctx) => {
  await ctx.addRepositoryFromCopr("quadratech188/vicinae");
  await ctx.installPackages("vicinae");

  const assets = await ctx.getReleaseAssets(
    "dagimg-dot/vicinae-gnome-extension",
  );
  const extensionAsset = assets.find((a) =>
    a.name.includes(".shell-extension"),
  );
  if (!extensionAsset)
    throw new Error("Vicinae GNOME extension asset not found");

  const tempDir = ctx.getTempDir(
    "vicinae-gnome-extension",
    extensionAsset.name,
  );
  const zipFile = join(tempDir, extensionAsset.name);
  await ctx.downloadFile(extensionAsset.url, zipFile);

  const extensionDir = "/usr/share/gnome-shell/extensions/vicinae@dagimg-dot";
  await $`mkdir -p ${extensionDir}`;
  await $`unzip -o ${zipFile} -d ${extensionDir}`;

  await $`systemctl --global enable vicinae`;
});
