import { $ } from "bun";
import tools from ".";

export async function installRpmsFromOras(ociUrl: string) {
  const tmpDir = await tools.files.createTmpDir("oras-rpms");
  await $`oras pull ${ociUrl} -o ${tmpDir}`;
  const rpms = await tools.files.list(tmpDir, (f) => f.endsWith(".rpm"));
  await tools.packages.installPackages(...rpms);
}
