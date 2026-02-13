import { join } from "path";
import { createTask } from "~/utils/create-variant";
import Core from "../_core/variant";
import { getBitwardenTask } from "./scripts/bitwarden";
import { getBuildEssentialsTask } from "./scripts/build-essentials";
import { getCursorTask } from "./scripts/cursor";
import { getLogiopsTask } from "./scripts/logiops";
import { getMiseTask } from "./scripts/mise";
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
    getBuildEssentialsTask("build-essentials"),
    getVirtualizationTask("virtualization"),
    getLogiopsTask("logiops"),
    getOpencodeTask("opencode"),
    getCursorTask("cursor"),
    getVscodeTask("vscode"),
    getVicinaeTask("vicinae"),
    getBitwardenTask("bitwarden"),
    getMiseTask("mise"),
    createTask("files", async (ctx) => {
      await ctx.copyFiles(join(ctx.baseDirectory, "files"));
    }),
  ],
);
