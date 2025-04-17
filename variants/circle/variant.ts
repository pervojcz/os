import { $ } from "bun";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { createVariant, type VariantCtx } from "~/utils/create-variant";
import { enableAutoUpdates } from "./scripts/auto-updates";
import { installCursor } from "./scripts/cursor";
import { downloadFonts } from "./scripts/fonts";
import { installNode } from "./scripts/node";
import { installPnpm } from "./scripts/pnpm";
import { installPrompt } from "./scripts/prompt";

export default createVariant(
  {
    imageTitle: "Circle OS",
    imageDescription: "Personal OS image based on Fedora Silverblue",
    baseImageName: "silverblue",
    baseImageVersion: "41",
    baseDirectory: __dirname,
  },
  async (ctx) => {
    await ctx.copyFiles(join(ctx.baseDirectory, "files"));

    await ctx.installPackages(
      `https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-${ctx.fedoraVersion}.noarch.rpm`,
      `https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-${ctx.fedoraVersion}.noarch.rpm`
    );

    await ctx.addRepositoryFromString(
      "firefoxpwa.repo",
      `
        [firefoxpwa]
        name=FirefoxPWA
        metadata_expire=300
        baseurl=https://packagecloud.io/filips/FirefoxPWA/rpm_any/rpm_any/$basearch
        gpgkey=https://packagecloud.io/filips/FirefoxPWA/gpgkey
        repo_gpgcheck=1
        gpgcheck=0
        enabled=1
      `
    );

    // await ctx.addRepositoryFromUrl(
    //   "https://download.docker.com/linux/fedora/docker-ce.repo"
    // );
    await enableDockerRepo(ctx); // TODO: remove when the repo is updated for 42

    await ctx.addRepositoryFromUrl(
      "https://packages.microsoft.com/yumrepos/vscode/config.repo"
    );

    // await ctx.addRepositoryFromCopr("matthaigh27/cursor");

    await ctx.installPackages(
      // drivers
      "intel-media-driver",
      "mesa-vulkan-drivers",
      "logiops",

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

      // VS Code
      "code",
      // "cursor",

      // Firefox PWA
      "firefoxpwa",

      // AWS CLI
      "awscli"
    );

    const rpms = await ctx.listFiles(
      join(ctx.baseDirectory, "packages"),
      (file) => file.endsWith(".rpm")
    );
    await ctx.installPackages(...rpms);

    // install Node
    await installNode(ctx);

    // install PNPM
    await installPnpm(ctx);

    // install SBP
    await installPrompt(ctx);

    // install Cursor
    await installCursor(ctx);

    // install fonts
    await downloadFonts(ctx);

    // overrides for GNOME
    await ctx.createGschemaOverride(
      "gnome-desktop-overrides",
      {
        schema: "org.gnome.mutter",
        overrides: {
          "center-new-windows": "true",
        },
      },
      {
        schema: "org.gnome.desktop.interface",
        overrides: {
          "font-name": "Geist 11",
          "document-font-name": "Geist 11",
          "monospace-font-name": "Geist Mono 10",
        },
      }
    );

    // enable services
    await $`systemctl enable docker logid`;

    // enable auto-updates
    await enableAutoUpdates();
  }
);

async function enableDockerRepo(ctx: VariantCtx) {
  const url = "https://download.docker.com/linux/fedora/docker-ce.repo";
  const fileName = url.split("/").reverse().shift()!;
  const outputPath = join(ctx.getTempDir("repo", "docker", fileName), fileName);
  await ctx.downloadFile(url, outputPath);

  // edit the content to temporarly use F41 urls
  const content = await readFile(outputPath, { encoding: "utf8" });
  const newContent = content.replace("$releasever", "41");
  await writeFile(outputPath, newContent, { encoding: "utf8" });

  await ctx.addRepositoryFromFile(fileName, outputPath);
}
