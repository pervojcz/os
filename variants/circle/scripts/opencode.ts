import { $ } from "bun";
import type { VariantCtx } from "~/utils/create-variant";

export async function installOpencode(ctx: VariantCtx) {
  // cli
  await $`bun add -g opencode-ai`;

  // desktop
  const assets = await ctx.getReleaseAssets("anomalyco/opencode");
  const desktopAsset = assets.find(
    (a) => a.name === `opencode-desktop-linux-${ctx.architecture}.rpm`,
  );
  if (!desktopAsset) throw new Error("No Opencode desktop .rpm found");
  await ctx.installPackages(desktopAsset.url);
}
