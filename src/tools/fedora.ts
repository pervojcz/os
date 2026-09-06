import { $ } from "bun";

type Architecture = {
  kernel: string;
  debian: string;
  nodejs: string;
};

const architectures: Record<string, Architecture> = {
  x86_64: {
    kernel: "x86_64",
    debian: "amd64",
    nodejs: "x64",
  },
  aarch64: {
    kernel: "aarch64",
    debian: "arm64",
    nodejs: "arm64",
  },
};

type FedoraInfo = {
  fedoraVersion: string;
  architecture: Architecture;
};

let fedoraInfoCache: FedoraInfo | null = null;

export async function getFedoraInfo() {
  if (fedoraInfoCache) return fedoraInfoCache;

  const fedoraVersion = (await $`rpm -E %fedora`.text()).trim();
  const architectureName = (await $`uname -m`.text()).trim();
  const architecture = architectures[architectureName]!;

  fedoraInfoCache = {
    fedoraVersion,
    architecture,
  };

  return fedoraInfoCache;
}
