import type { VariantCtx } from "~/utils/create-variant";

export async function installVicinae(ctx: VariantCtx) {
  await ctx.addRepositoryFromCopr("quadratech188/vicinae");
  await ctx.installPackages("vicinae");
}
