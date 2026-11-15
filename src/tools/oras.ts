import { $ } from "bun";
import { exists } from "node:fs/promises";
import { join } from "node:path";
import tools from ".";

const orasPath = "/tmp/oras";

async function ensureOrasInstalled() {
  if (await exists(orasPath)) return;

  console.info("Installing oras...");
  const fedoraInfo = await tools.fedora.getFedoraInfo();
  const arch = fedoraInfo.architecture.debian;

  const releases = await tools.github.getReleaseAssets("oras-project/oras");
  const release = releases.find((a) =>
    a.name.endsWith(`_linux_${arch}.tar.gz`),
  );

  if (!release) {
    console.error(
      `No release found for architecture ${arch} in oras-project/oras`,
    );
    process.exit(1);
  }

  const downloadDir = await tools.files.createTmpDir("oras");
  const downloadPath = join(downloadDir, release.name);
  await tools.download.downloadFile(release.url, downloadPath);

  await $`tar -xzf ${downloadPath} -C ${downloadDir}`;
  await $`mv ${downloadDir}/oras ${orasPath}`;
  await $`chmod +x ${orasPath}`;
}

export async function installRpmsFromOras(ociUrl: string) {
  await ensureOrasInstalled();
  const tmpDir = await tools.files.createTmpDir("oras-rpms");
  await $`${orasPath} pull ${ociUrl} -o ${tmpDir}`;
  const rpms = await tools.files.list(tmpDir, (f) => f.endsWith(".rpm"));
  await tools.packages.installPackages(...rpms);
}
