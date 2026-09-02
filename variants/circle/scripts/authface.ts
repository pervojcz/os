import tools from "~/tools";

export async function installAuthFace() {
  const { fedoraVersion } = await tools.fedora.getFedoraInfo();
  await tools.oras.installRpmsFromOras(
    `ghcr.io/pervoj/authface-rpms:f${fedoraVersion}`,
  );
}
