import { createTaskGetter } from "~/utils/create-variant";

export const getPythonTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    "python3",
    "python3-pip",
    "python3-virtualenv",
    "python3-wheel",
    "python3-devel",
  );
});
