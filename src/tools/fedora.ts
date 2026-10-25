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
  kernelRelease: string;
  fedoraVersion: string;
  architecture: Architecture;
};

let fedoraInfoCache: FedoraInfo | null = null;

export async function getFedoraInfo() {
  if (fedoraInfoCache) return fedoraInfoCache;

  const kernelRelease = (
    await $`rpm -q --qf "%{version}-%{release}.%{arch}\n" kernel-core | tail -n 1`.text()
  ).trim();

  const kernelReleaseParts = kernelRelease.split(".");
  const architectureName = kernelReleaseParts.pop()!;
  const fedoraVersion = kernelReleaseParts.pop()!.replace("fc", "");

  const architecture = architectures[architectureName]!;

  fedoraInfoCache = {
    kernelRelease,
    fedoraVersion,
    architecture,
  };

  return fedoraInfoCache;
}
