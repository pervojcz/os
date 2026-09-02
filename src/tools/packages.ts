import { $ } from "bun";

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
