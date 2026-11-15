import tools from "~/tools";

export async function installMiscPackages() {
  await tools.packages.installPackages(
    "firewall-config",
    "gnome-tweaks",
    "langpacks-cs",
    "nautilus-python",
    "steam-devices",

    // appimage libs
    "fuse",
    "fuse-libs",
  );
}
