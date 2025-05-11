import { $ } from "bun";
import { writeFile } from "fs/promises";
import type { VariantCtx } from "~/utils/create-variant";

export async function installPnpm(ctx: VariantCtx) {
  const pnpmPath = "/usr/share/pnpm";

  await ctx.downloadFile(
    "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linux-x64",
    `${pnpmPath}/pnpm`
  );

  await writeFile(
    `${pnpmPath}/pnpx`,
    ctx.trimLines(`
        #!/bin/sh
        exec pnpm dlx "$@"
      `),
    "utf-8"
  );

  await $`chmod +x ${pnpmPath}/pnpm`;
  await $`chmod +x ${pnpmPath}/pnpx`;

  await ctx.addToPath("pnpm", pnpmPath, ["PNPM_HOME", "$HOME/.pnpm"]);
}
