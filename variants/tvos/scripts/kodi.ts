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
  const sedPathStr = `s/${pathToReplace}/${pathReplacement}/g`;

  const strToReplace = "Alias=display-manager.service";
  const strReplacement = [
    "WantedBy=multi-user.target",
    "Alias=display-manager.service",
  ].join("\\n");
  const sedWantedByStr = `s/${strToReplace}/${strReplacement}/g`;

  await $`sed -i -e ${sedPathStr} -e ${sedWantedByStr} ${tmpDir}/x86/init/*.service`;
  await $`sed -i -e ${sedPathStr} -e ${sedWantedByStr} ${tmpDir}/arm/init/*.service`;

  await $`echo -e "\ng power -" >> ${tmpDir}/x86/init/sysusers.conf`;
  await $`echo -e "\ng power -" >> ${tmpDir}/arm/init/sysusers.conf`;

  await tools.packages.installPackages("make");
  await $`make install -C ${tmpDir}`;

  await $`systemd-sysusers`;
  await $`systemd-tmpfiles --create`;

  await $`systemctl enable kodi-gbm.service`;
}
