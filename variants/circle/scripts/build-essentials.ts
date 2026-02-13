import { createTaskGetter } from "~/utils/create-variant";

export const getBuildEssentialsTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    "make",
    "cmake",
    "automake",
    "gcc",
    "gcc-c++",
    "meson",
    "ninja-build",
    "pkg-config",
  );
});
