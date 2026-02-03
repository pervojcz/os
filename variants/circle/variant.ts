import { $ } from "bun";
import { join } from "path";
import Core from "../_core/variant";
import { installBitwarden } from "./scripts/bitwarden";
import { installCursor } from "./scripts/cursor";
import { installOpencode } from "./scripts/opencode";

export default Core.extend(
  {
    imageTitle: "Circle OS",
    imageDescription: "Personal OS image based on Fedora Silverblue",
    baseDirectory: __dirname,
  },
  async (ctx) => {
    await ctx.copyFiles(join(ctx.baseDirectory, "files"));

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
      `,
    );

    await ctx.addRepositoryFromUrl(
      "https://packages.microsoft.com/yumrepos/vscode/config.repo",
    );

    await ctx.addRepositoryFromCopr("jdxcode/mise");

    await ctx.installPackages(
      // drivers
      "logiops",

      // VS Code
      "code",

      // Tools
      "mise",

      // build essentials
      "make",
      "cmake",
      "automake",
      "gcc",
      "gcc-c++",
      "meson",
      "ninja-build",
      "pkg-config",

      // Virtualization
      "virt-install",
      "libvirt-daemon-config-network",
      "libvirt-daemon-kvm",
      "qemu-kvm",
    );

    // install Cursor
    await installCursor(ctx);

    // install Opencode
    await installOpencode(ctx);

    // install Bitwarden
    await installBitwarden(ctx);

    // enable services
    await $`systemctl enable logid`;
  },
);
