import { $ } from "bun";
import { join } from "path";
import tools from "~/tools";

export async function installVicinae() {
  // install Vicinae
  await tools.repos.addRepositoryFromCopr("quadratech188/vicinae");
  await tools.packages.installPackages("vicinae");
  await $`systemctl --global enable vicinae`;

  // install Vicinae GNOME extension
  const assets = await tools.github.getReleaseAssets(
    "dagimg-dot/vicinae-gnome-extension",
  );
  const extensionAsset = assets.find((a) =>
    a.name.includes(".shell-extension"),
  );
  if (!extensionAsset) {
    throw new Error("Vicinae GNOME extension asset not found");
  }
  const tempDir = await tools.files.createTmpDir(
    "vicinae-gnome-extension",
    extensionAsset.name,
  );
  const zipFile = join(tempDir, extensionAsset.name);
  await tools.download.downloadFile(extensionAsset.url, zipFile);

  const extensionDir = "/usr/share/gnome-shell/extensions/vicinae@dagimg-dot";
  await $`mkdir -p ${extensionDir}`;
  await $`unzip -o ${zipFile} -d ${extensionDir}`;
  await $`glib-compile-schemas ${join(extensionDir, "schemas")}`;
}
