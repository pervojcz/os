import { $ } from "bun";
import tools from "~/tools";

export async function installKodi() {
  await tools.packages.installPackages("kodi");
  await installKodiStandaloneService();
}

async function installKodiStandaloneService() {
  const gitUrl = "https://github.com/graysky2/kodi-standalone-service.git";
  const tmpDir = await tools.files.createTmpDir("kodi-standalone-service");
  await $`git clone ${gitUrl} ${tmpDir}`;

  const pathToReplace = "/usr/lib/kodi/kodi.bin".replaceAll("/", "\\/");
  const pathReplacement = "/usr/bin/kodi".replaceAll("/", "\\/");
  const sedStr = `s/${pathToReplace}/${pathReplacement}/g`;

  await $`sed -i ${sedStr} ${tmpDir}/x86/init/*.service`;
  await $`sed -i ${sedStr} ${tmpDir}/arm/init/*.service`;

  await tools.packages.installPackages("make");
  await $`make install -C ${tmpDir}`;

  await $`systemd-sysusers`;
  await $`systemd-tmpfiles --create`;

  await $`systemctl enable kodi-gbm.service`;
}
