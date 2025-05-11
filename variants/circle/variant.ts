import { $ } from "bun";
import { join } from "path";
import Core from "../core/variant";
import { installCursor } from "./scripts/cursor";

Core.extend(
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
      `
    );

    await ctx.addRepositoryFromUrl(
      "https://packages.microsoft.com/yumrepos/vscode/config.repo"
    );

    // await ctx.addRepositoryFromCopr("matthaigh27/cursor");

    await ctx.installPackages(
      // drivers
      "logiops",

      // VS Code
      "code",
      // "cursor",

      // Firefox PWA
      "firefoxpwa",

      // AWS CLI
      "awscli"
    );

    // install Cursor
    await installCursor(ctx);

    // enable services
    await $`systemctl enable logid`;
  }
);
