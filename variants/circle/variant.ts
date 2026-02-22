import { join } from "path";
import { createTask, mergeTasks } from "~/utils/create-variant";
import Core from "../_core/variant";
import { getBitwardenTask } from "./scripts/bitwarden";
import { getBuildEssentialsTask } from "./scripts/build-essentials";
import { getCursorTask } from "./scripts/cursor";
import { getLogiopsTask } from "./scripts/logiops";
import { getMiseTask } from "./scripts/mise";
import { getNiriTask } from "./scripts/niri";
import { getOpencodeTask } from "./scripts/opencode";
import { getVicinaeTask } from "./scripts/vicinae";
import { getVirtualizationTask } from "./scripts/virtualization";
import { getVscodeTask } from "./scripts/vscode";

export default Core.extend(
  {
    name: "circle",
    imageTitle: "Circle OS",
    imageDescription: "Personal OS image based on Fedora Silverblue",
    baseDirectory: __dirname,
  },
  [],
  [
    mergeTasks("dev-environment", [
      getBuildEssentialsTask("build-essentials"),
      getVirtualizationTask("virtualization"),
      getMiseTask("mise"),
    ]),
    getLogiopsTask("logiops"),
    mergeTasks("code-editors", [
      getOpencodeTask("opencode"),
      getCursorTask("cursor"),
      getVscodeTask("vscode"),
    ]),
    mergeTasks("desktop-apps", [
      getVicinaeTask("vicinae"),
      getBitwardenTask("bitwarden"),
    ]),
    getNiriTask("niri"),
    createTask("files", async (ctx) => {
      await ctx.copyFiles(join(ctx.baseDirectory, "files"));
    }),
  ],
);
