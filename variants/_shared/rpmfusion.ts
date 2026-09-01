import tools from "~/tools";

export async function enableRpmfusion() {
  const { fedoraVersion } = await tools.fedora.getFedoraInfo();
  await tools.packages.installPackages(
    `https://ftp.fi.muni.cz/pub/linux/rpmfusion/free/fedora/rpmfusion-free-release-${fedoraVersion}.noarch.rpm`,
    `https://ftp.fi.muni.cz/pub/linux/rpmfusion/nonfree/fedora/rpmfusion-nonfree-release-${fedoraVersion}.noarch.rpm`,
  );
}
