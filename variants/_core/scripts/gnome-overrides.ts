import { $ } from "bun";
import { createTaskGetter } from "~/utils/create-variant";

export const getGnomeOverridesTask = createTaskGetter(async (ctx) => {
  await ctx.createGschemaOverride(
    "custom.gnome",
    {
      schema: "org.gnome.mutter",
      overrides: {
        "center-new-windows": "true",
      },
    },
    {
      schema: "org.gnome.desktop.interface",
      overrides: {
        "font-name": "'Geist 11'",
        "document-font-name": "'Geist 11'",
        "monospace-font-name": "'Geist Mono 10'",
      },
    },
  );

  // remove GNOME Software plugin for Fedora upgrades
  await $`rm /usr/lib64/gnome-software/plugins-*/libgs_plugin_fedora-pkgdb-collections.so`;
});
