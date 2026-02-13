import { $ } from "bun";
import { createTaskGetter } from "~/utils/create-variant";

export const getOpencodeTask = createTaskGetter(async (ctx) => {
  const assets = await ctx.getReleaseAssets("anomalyco/opencode");

  const desktopAsset = assets.find(
    (a) => a.name === `opencode-desktop-linux-${ctx.architecture}.rpm`,
  );
  if (!desktopAsset) throw new Error("Opencode assets not found");

  await ctx.installPackages(desktopAsset.url);

  await $`mkdir -p /usr/share/opencode`;
  await $`mv /usr/bin/OpenCode /usr/share/opencode/OpenCode`;
  await $`mv /usr/bin/opencode-cli /usr/share/opencode/opencode-cli`;
  await $`ln -s /usr/share/opencode/OpenCode /usr/bin/opencode-desktop`;
  await $`ln -s /usr/share/opencode/opencode-cli /usr/bin/opencode`;
  await $`ln -s /usr/share/opencode/opencode-cli /usr/bin/oc`;

  await $`sed -i 's|^Exec=OpenCode|Exec=env OC_ALLOW_WAYLAND=1 /usr/share/opencode/OpenCode|g' /usr/share/applications/OpenCode.desktop`;
});
