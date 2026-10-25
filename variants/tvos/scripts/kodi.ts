import { $ } from "bun";
import { join } from "node:path";
import tools from "~/tools";

export async function installKodi() {
  await tools.packages.installPackages("kodi");
  await installKodiStandaloneService();
}

async function installKodiStandaloneService() {
  const tmpDir = await tools.files.createTmpDir("printer-drivers");
  const zipPath = join(tmpDir, "kodi-standalone-service.zip");

  await tools.download.downloadFile(
    "https://github.com/graysky2/kodi-standalone-service/archive/refs/heads/master.zip",
    zipPath,
  );
  await $`unzip -o ${zipPath} -d ${tmpDir}`;

  const projectDir = join(tmpDir, "kodi-standalone-service-master");

  const pathToReplace = "/usr/lib/kodi/kodi.bin".replaceAll("/", "\\/");
  const pathReplacement = "/usr/bin/kodi".replaceAll("/", "\\/");
  const sedStr = `s/${pathToReplace}/${pathReplacement}/g`;

  await $`sed -i ${sedStr} ${join(projectDir, "x86", "init", "*.service")}`;
  await $`sed -i ${sedStr} ${join(projectDir, "arm", "init", "*.service")}`;

  await $`make install -C ${projectDir}`;

  await $`systemd-sysusers`;
  await $`systemd-tmpfiles --create`;

  await $`systemctl enable kodi-gbm.service`;
}
