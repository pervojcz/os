import type { VariantCtx } from "~/utils/create-variant";

export async function installCursor(ctx: VariantCtx) {
  await ctx.addRepositoryFromString(
    "cursor.repo",
    `
      [cursor]
      name=Cursor
      baseurl=https://downloads.cursor.com/yumrepo
      enabled=1
      gpgcheck=1
      gpgkey=https://downloads.cursor.com/keys/anysphere.asc
      repo_gpgcheck=1
    `,
  );

  await ctx.installPackages("cursor");
}
