import { createTaskGetter } from "~/utils/create-variant";

export const getPromptTask = createTaskGetter(async (ctx) => {
  const sbpPath = "/usr/share/sbp";
  await ctx.cloneGitRepo("https://github.com/brujoand/sbp.git", sbpPath);
  await ctx.createProfileScript(
    "sbp",
    `
      export SBP_PATH=${sbpPath}
      source \$SBP_PATH/sbp.bash
    `,
  );
});
