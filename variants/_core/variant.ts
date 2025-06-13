import { $ } from "bun";
import { join } from "path";
import { createVariant } from "~/utils/create-variant";
import { enableAutoUpdates } from "./scripts/auto-updates";
import { installBun } from "./scripts/bun";
import { downloadFonts } from "./scripts/fonts";
import { installNode } from "./scripts/node";
import { installPnpm } from "./scripts/pnpm";
import { installPrompt } from "./scripts/prompt";

export default createVariant(
  {
    imageTitle: "Core Image OS",
    imageDescription: "Core Image OS based on Fedora Silverblue",
    baseImageName: "silverblue",
    baseImageVersion: "42",
    baseDirectory: __dirname,
  },
  async (ctx) => {
    await ctx.copyFiles(join(ctx.baseDirectory, "files"));

    await ctx.installPackages(
      `https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-${ctx.fedoraVersion}.noarch.rpm`,
      `https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-${ctx.fedoraVersion}.noarch.rpm`
    );

    await ctx.addRepositoryFromUrl(
      "https://download.docker.com/linux/fedora/docker-ce.repo"
    );

    await ctx.installPackages(
      // drivers
      "intel-media-driver",
      "mesa-vulkan-drivers",

      // codecs
      "gstreamer1-plugin-openh264",
      "gstreamer1-plugins-bad-free-extras",
      "gstreamer1-plugins-bad-free-fluidsynth",
      "gstreamer1-plugins-bad-free-wildmidi",
      "gstreamer1-plugins-bad-free-zbar",
      "gstreamer1-plugins-good-extras",
      "gstreamer1-plugins-good-gtk",
      "lame",

      // misc packages
      "grubby",
      "langpacks-cs",
      "gnome-tweaks",
      "firewall-config",
      "nautilus-python",
      "steam-devices",
      "twitter-twemoji-fonts",
      "chkconfig",

      // Docker
      "docker-ce",
      "docker-ce-cli",
      "containerd.io",
      "docker-buildx-plugin",
      "docker-compose-plugin",

      // Python
      "python3",
      "python3-pip",
      "python3-virtualenv",
      "python3-wheel",
      "python3-devel",
      "python3-tkinter"
    );

    const rpms = await ctx.listFiles(
      join(ctx.baseDirectory, "packages"),
      (file) => file.endsWith(".rpm")
    );
    await ctx.installPackages(...rpms);

    // install Bun
    await installBun(ctx);

    // install Node
    await installNode(ctx);

    // install PNPM
    await installPnpm(ctx);

    // install SBP
    await installPrompt(ctx);

    // install fonts
    await downloadFonts(ctx);

    // overrides for GNOME
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
      }
    );

    // enable services
    await $`systemctl enable docker`;

    // enable auto-updates
    await enableAutoUpdates();

    // remove GNOME Software plugin for Fedora upgrades
    await $`rm /usr/lib64/gnome-software/plugins-*/libgs_plugin_fedora-pkgdb-collections.so`;
  }
);
