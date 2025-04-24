import { $ } from "bun";
import { writeFile } from "fs/promises";
import type { VariantCtx } from "~/utils/create-variant";

export async function installBun(ctx: VariantCtx) {
  const bunxPath = "/usr/bin/bunx";

  await writeFile(
    bunxPath,
    ctx.trimLines(`
        #!/bin/sh
        exec bun x "$@"
      `),
    "utf-8"
  );

  await $`chmod +x ${bunxPath}`;

  await ctx.addToPath("bun-bin", "$HOME/.bun/bin");
}
