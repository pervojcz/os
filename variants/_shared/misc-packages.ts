import tools from "~/tools";

export async function installMiscPackages() {
  await tools.packages.installPackages(
    "firewall-config",
    "gnome-tweaks",
    "golang-oras",
    "langpacks-cs",
    "nautilus-python",
    "steam-devices",
  );
}
