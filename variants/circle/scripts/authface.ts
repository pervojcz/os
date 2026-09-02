import { $ } from "bun";
import tools from "~/tools";

export async function installAuthFace() {
  const { fedoraVersion } = await tools.fedora.getFedoraInfo();
  const tempDir = await tools.files.createTmpDir("authface");

  const ociUrl = `ghcr.io/pervoj/authface-rpms:f${fedoraVersion}`;
  await $`oras pull ${ociUrl} -o ${tempDir}`;

  const rpms = await tools.files.list(tempDir, (f) => f.endsWith(".rpm"));
  console.log(`Installing ${rpms.length} AuthFace RPMs`);

  await tools.packages.installPackages(...rpms);
}
