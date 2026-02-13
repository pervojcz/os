import { createTaskGetter } from "~/utils/create-variant";

export const getMiseTask = createTaskGetter(async (ctx) => {
  await ctx.addRepositoryFromCopr("jdxcode/mise");
  await ctx.installPackages("mise");
});
