import { join } from "path";
import { createTask, createVariant, mergeTasks } from "~/utils/create-variant";
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
    baseImageVersion: "44",
    baseDirectory: __dirname,
  },
  [
    mergeTasks("media-packages", [
      getRpmfusionTask("rpmfusion"),
      getDriversTask("drivers"),
      getCodecsTask("codecs"),
    ]),
    mergeTasks("system-packages", [
      getPythonTask("python"),
      getMiscPackagesTask("misc-packages"),
    ]),
    getDockerTask("docker"),
    mergeTasks("js-tooling", [
      getBunTask("bun"),
      getNodeTask("node"),
      getPnpmTask("pnpm"),
    ]),
    getPromptTask("prompt"),
    mergeTasks("desktop-overrides", [
      getFontsTask("fonts"),
      getGnomeOverridesTask("gnome-overrides"),
    ]),
    getAutoUpdatesTask("auto-updates"),
    createTask("local-assets", async (ctx) => {
      await ctx.copyFiles(join(ctx.baseDirectory, "files"));

      const rpms = await ctx.listFiles(
        join(ctx.baseDirectory, "packages"),
        (file) => file.endsWith(".rpm"),
      );
      await ctx.installPackages(...rpms);
    }),
  ],
);
