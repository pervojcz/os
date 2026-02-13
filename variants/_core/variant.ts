import { join } from "path";
import { createTask, createVariant } from "~/utils/create-variant";
import { getAutoUpdatesTask } from "./scripts/auto-updates";
import { getBunTask } from "./scripts/bun";
import { getCodecsTask } from "./scripts/codecs";
import { getDockerTask } from "./scripts/docker";
import { getDriversTask } from "./scripts/drivers";
import { getFontsTask } from "./scripts/fonts";
import { getGnomeOverridesTask } from "./scripts/gnome-overrides";
import { getMiscPackagesTask } from "./scripts/misc-packages";
import { getNodeTask } from "./scripts/node";
import { getPnpmTask } from "./scripts/pnpm";
import { getPromptTask } from "./scripts/prompt";
import { getPythonTask } from "./scripts/python";
import { getRpmfusionTask } from "./scripts/rpmfusion";

export default createVariant(
  {
    name: "core",
    imageTitle: "Core Image OS",
    imageDescription: "Core Image OS based on Fedora Silverblue",
    baseImageName: "silverblue",
    baseImageVersion: "43",
    baseDirectory: __dirname,
  },
  [
    getRpmfusionTask("rpmfusion"),
    getDriversTask("drivers"),
    getCodecsTask("codecs"),
    getPythonTask("python"),
    getMiscPackagesTask("misc-packages"),
    getDockerTask("docker"),
    getBunTask("bun"),
    getNodeTask("node"),
    getPnpmTask("pnpm"),
    getPromptTask("prompt"),
    getFontsTask("fonts"),
    getGnomeOverridesTask("gnome-overrides"),
    getAutoUpdatesTask("auto-updates"),
    createTask("files", async (ctx) => {
      await ctx.copyFiles(join(ctx.baseDirectory, "files"));
    }),
    createTask("packages-from-files", async (ctx) => {
      const rpms = await ctx.listFiles(
        join(ctx.baseDirectory, "packages"),
        (file) => file.endsWith(".rpm"),
      );
      await ctx.installPackages(...rpms);
    }),
  ],
);
