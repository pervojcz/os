import { createTaskGetter } from "~/utils/create-variant";

export const getNiriTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    "niri",
    "waybar",
    "swaylock",
    "swayidle",
    "swaybg",
    "mako",
    "fuzzel",
    "wl-clipboard",
    "xdg-desktop-portal",
    "xdg-desktop-portal-gtk",
    "xwayland-satellite",
    "grim",
    "slurp",
  );
});
