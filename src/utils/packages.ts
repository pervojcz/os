import { $, type ShellError } from "bun";

export type InstallPackagesOptions = {
  idempotent?: boolean;
  repos?: string[];
};

export async function isPackageInstalled(packageName: string) {
  const result = await $`rpm -q ${packageName}`.nothrow();
  return result.exitCode === 0;
}

function parseInstallArgs(args: (string | InstallPackagesOptions)[]) {
  const packages: string[] = [];
  let options: InstallPackagesOptions = {};

  for (const arg of args) {
    if (typeof arg === "string") {
      packages.push(arg);
      continue;
    }

    options = arg;
  }

  return { packages, options };
}

export async function installPackages(...args: (string | InstallPackagesOptions)[]) {
  const { packages, options } = parseInstallArgs(args);
  if (!packages.length) return;
  console.log("Installing packages:", ...packages);

  const flags: string[] = [];
  if (options.idempotent) flags.push("--idempotent");
  if (options.repos?.length) {
    flags.push("--disablerepo=*");
    for (const repo of options.repos) {
      flags.push(`--enablerepo=${repo}`);
    }
  }

  try {
    await $`rpm-ostree install ${flags} ${packages}`;
  } catch (e) {
    const error = e as ShellError;

    console.error(
      "Failed to install packages:",
      error.message,
      "\n",
      String.fromCharCode(...error.stderr)
    );

    throw error;
  }
}

export async function uninstallPackages(...packages: string[]) {
  if (!packages.length) return;
  console.log("Uninstalling packages:", ...packages);
  await $`rpm-ostree uninstall ${packages}`;
}

function getKojiSourceName(packageName: string) {
  switch (packageName) {
    case "glibc-devel":
      return "glibc";
    case "gcc-c++":
      return "gcc";
    case "libstdc++-devel":
      return "libstdc++";
    default:
      return packageName;
  }
}

export type MatchingBasePackage = {
  package: string;
  reference: string;
};

export async function installPackagesMatchingBase(
  specs: MatchingBasePackage[],
) {
  const urls: string[] = [];

  for (const { package: packageName, reference } of specs) {
    const [version, release, arch] = (
      await $`rpm -q ${reference} --qf '%{VERSION} %{RELEASE} %{ARCH}'`.text()
    )
      .trim()
      .split(/\s+/);

    const sourceName = getKojiSourceName(packageName);
    urls.push(
      `https://kojipkgs.fedoraproject.org/packages/${sourceName}/${version}/${release}/${arch}/${packageName}-${version}-${release}.${arch}.rpm`,
    );
  }

  await installPackages(...urls);
}

export async function replacePackages(
  remove: string[],
  install: string[],
) {
  if (!remove.length || !install.length) {
    await uninstallPackages(...remove);
    await installPackages(...install);
    return;
  }

  console.log("Replacing packages:", ...remove, "->", ...install);
  await $`rpm-ostree override remove ${remove} --install ${install}`;
}
