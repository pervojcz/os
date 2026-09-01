import { $ } from "bun";

type FedoraInfo = {
  fedoraVersion: string;
  architecture: string;
  architectureGeneral: string;
};

let fedoraInfoCache: FedoraInfo | null = null;

export async function getFedoraInfo() {
  if (fedoraInfoCache) return fedoraInfoCache;

  const fedoraVersion = (await $`rpm -E %fedora`.text()).trim();
  const architecture = (await $`uname -m`.text()).trim();
  const architectureGeneral = getArchitectureGeneral(architecture);

  fedoraInfoCache = {
    fedoraVersion,
    architecture,
    architectureGeneral,
  };

  return fedoraInfoCache;
}

function getArchitectureGeneral(architecture: string) {
  switch (architecture) {
    case "x86_64":
      return "x64";
    case "aarch64":
      return "arm64";
    default:
      return architecture;
  }
}
