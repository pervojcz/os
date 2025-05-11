import type { VariantCtx } from "~/utils/create-variant";

export async function installPrompt(ctx: VariantCtx) {
  const sbpPath = "/usr/share/sbp";
  await ctx.cloneGitRepo("https://github.com/brujoand/sbp.git", sbpPath);
  await ctx.createProfileScript(
    "sbp",
    `
      export SBP_PATH=${sbpPath}
      source \$SBP_PATH/sbp.bash
    `
  );
}
