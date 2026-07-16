import { createTaskGetter } from "~/utils/create-variant";

export const getBuildEssentialsTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    "make",
    "cmake",
    "automake",
    "meson",
    "ninja-build",
    "pkg-config",
  );

  if (!(await ctx.isPackageInstalled("gcc"))) {
    // NVIDIA images ship multilib i686 packages; pin compilers to x86_64 and
    // resolve them from archive repos that match the pinned ostree base.
    await ctx.installPackages(
      "gcc.x86_64",
      "gcc-c++.x86_64",
      { repos: ["updates-archive", "fedora"] },
    );
  }
});
