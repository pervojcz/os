import { $ } from "bun";
import { createTaskGetter } from "~/utils/create-variant";

export const getLogiopsTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages("logiops");
  await $`systemctl enable logid`;
});
