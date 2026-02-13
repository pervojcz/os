import { createTaskGetter } from "~/utils/create-variant";

export const getDriversTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages("intel-media-driver", "mesa-vulkan-drivers");
});
