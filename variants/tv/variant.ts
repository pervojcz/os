import { createTask } from "~/utils/create-variant";
import Core from "../_core/variant";

export default Core.extend(
  {
    name: "tv",
    imageTitle: "TV OS",
    imageDescription: "Custom TV OS image based on Fedora Silverblue",
    baseDirectory: __dirname,
  },
  [],
  [
    createTask("kodi", async (ctx) => {
      await ctx.installPackages("kodi");
    }),
  ],
);
