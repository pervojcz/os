import { createTaskGetter } from "~/utils/create-variant";

export const getVscodeTask = createTaskGetter(async (ctx) => {
  await ctx.addRepositoryFromUrl(
    "https://packages.microsoft.com/yumrepos/vscode/config.repo",
  );

  await ctx.installPackages("code");
});
