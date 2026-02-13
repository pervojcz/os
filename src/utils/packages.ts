import { $, type ShellError } from "bun";

export async function installPackages(...packages: string[]) {
  if (!packages.length) return;
  console.log("Installing packages:", ...packages);

  try {
    await $`rpm-ostree install ${packages}`;
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
