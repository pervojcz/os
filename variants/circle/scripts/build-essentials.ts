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
    // NVIDIA images pin older glibc/cpp versions that no longer match live
    // repos, so install toolchain RPMs that match the base image via Koji.
    await ctx.installPackagesMatchingBase([
      { package: "glibc-devel", reference: "glibc" },
      { package: "gcc", reference: "cpp" },
      { package: "gcc-c++", reference: "cpp" },
    ]);
  }
});
