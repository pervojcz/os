import { $ } from "bun";
import { writeFile } from "fs/promises";
import { join } from "path";
import { createTaskGetter } from "~/utils/create-variant";

export const getPnpmTask = createTaskGetter(async (ctx) => {
  const pnpmPath = "/usr/share/pnpm";

  await $`mkdir -p ${pnpmPath}`;

  const archivePath = join(ctx.getTempDir("pnpm", "archive"), "pnpm.tar.gz");
  await ctx.downloadFile(
    "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linux-x64.tar.gz",
    archivePath,
  );
  await $`tar -xzf ${archivePath} -C ${pnpmPath} pnpm`;

  await writeFile(
    `${pnpmPath}/pnpx`,
    ctx.trimLines(`
        #!/bin/sh
        exec pnpm dlx "$@"
      `),
    "utf-8",
  );

  await $`chmod +x ${pnpmPath}/pnpm`;
  await $`chmod +x ${pnpmPath}/pnpx`;

  await ctx.addToPath("pnpm", pnpmPath, ["PNPM_HOME", "$HOME/.pnpm"]);
});
