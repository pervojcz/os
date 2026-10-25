import { $ } from "bun";
import tools from ".";

export async function isPackageInstalled(packageName: string) {
  const result = await $`rpm -q ${packageName}`.nothrow();
  return result.exitCode === 0;
}

export async function installPackages(...packages: string[]) {
  if (!packages.length) return;
  console.log("Installing packages:", ...packages);
  await $`dnf5 -y install ${packages}`;
}

export async function uninstallPackages(...packages: string[]) {
  if (!packages.length) return;
  console.log("Uninstalling packages:", ...packages);
  await $`dnf5 -y remove ${packages}`;
}

export async function replacePackages(remove: string[], install: string[]) {
  if (!remove.length || !install.length) {
    await uninstallPackages(...remove);
    await installPackages(...install);
    return;
  }

  console.log("Replacing packages:", ...remove, "->", ...install);
  await $`dnf5 -y --allowerasing remove ${remove} install ${install}`;
}

export async function upgrade() {
  console.log("Upgrading packages");
  await $`dnf5 -y upgrade`;
}

export async function downloadPackages(...packages: string[]) {
  if (!packages.length) return [];
  console.log("Downloading packages:", ...packages);
  const tmpDir = await tools.files.createTmpDir("pkgs", ...packages);
  await $`dnf5 -y download --destdir=${tmpDir} ${packages}`;
  return await tools.files.list(tmpDir);
}

export async function extractPackage(packagePath: string, outputDir: string) {
  console.log("Extracting package:", packagePath, "->", outputDir);
  await $`rpm2cpio ${packagePath} | cpio -idm -D ${outputDir}`;
}
