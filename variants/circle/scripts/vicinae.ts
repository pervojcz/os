import { $ } from "bun";
import { join } from "path";
import tools from "~/tools";

export async function installVicinae() {
  await tools.repos.addRepositoryFromCopr("quadratech188/vicinae");
  await tools.packages.installPackages("vicinae");

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

  await $`gnome-extensions install --force ${zipFile}`;

  // const extensionDir = "/usr/share/gnome-shell/extensions/vicinae@dagimg-dot";
  // await $`mkdir -p ${extensionDir}`;
  // await $`unzip -o ${zipFile} -d ${extensionDir}`;

  await $`systemctl --global enable vicinae`;
}
