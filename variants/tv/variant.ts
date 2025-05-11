import Core from "../_core/variant";

Core.extend(
  {
    imageTitle: "TV OS",
    imageDescription: "Custom TV OS image based on Fedora Silverblue",
    baseDirectory: __dirname,
  },
  async (ctx) => {
    await ctx.installPackages(
      // drivers
      "kodi"
    );
  }
);
