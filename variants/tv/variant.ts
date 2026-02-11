import Core from "../_core/variant";
import { createTask } from "~/utils/create-variant";

export default Core.extend(
  {
    imageTitle: "TV OS",
    imageDescription: "Custom TV OS image based on Fedora Silverblue",
    baseDirectory: __dirname,
  },
  [
    createTask("tv", async (ctx) => {
      await ctx.installPackages(
        // drivers
        "kodi",
      );
    }),
  ],
);
