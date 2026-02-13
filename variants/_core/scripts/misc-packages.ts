import { createTaskGetter } from "~/utils/create-variant";

export const getMiscPackagesTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    "grubby",
    "langpacks-cs",
    "gnome-tweaks",
    "firewall-config",
    "nautilus-python",
    "steam-devices",
    "twitter-twemoji-fonts",
    "chkconfig",
  );
});
