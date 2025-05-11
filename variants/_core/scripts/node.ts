import { $ } from "bun";
import { mkdir, readdir, writeFile } from "fs/promises";
import { join } from "path";
import type { VariantCtx } from "~/utils/create-variant";

export async function installNode(ctx: VariantCtx) {
  const nodePath = "/usr/share/node";

  type Res = { date: string; version: string }[];
  const res = await fetch("https://nodejs.org/dist/index.json");
  const data = (await res.json()) as Res;
  const latest = data.sort((a, b) => b.date.localeCompare(a.date)).shift()!;
  const version = latest.version;

  const url = `https://nodejs.org/dist/${version}/node-${version}-linux-x64.tar.xz`;
  const fileName = join(ctx.getTempDir("node", "archive"), "node.tar.xz");
  await ctx.downloadFile(url, fileName);

  const unzipPath = ctx.getTempDir("node", "contents");
  await $`tar -xJf ${fileName} -C ${unzipPath}`;
  const unzipContentPath = join(unzipPath, (await readdir(unzipPath))[0]);
  await $`mv ${unzipContentPath} ${nodePath}`;

  await ctx.createProfileScript(
    "node-vars",
    `
      export NODEJS_HOME="${nodePath}"
      export NODE_COMPILE_CACHE="$HOME/.cache/nodejs-compile-cache"
    `
  );
  await ctx.addToPath("node-bin", "$NODEJS_HOME/bin");

  const nodeEtcPath = join(nodePath, "etc");
  const npmrcPath = join(nodeEtcPath, "npmrc");
  await ctx.addToPath(
    "npm-pkg",
    ["NPM_HOME", "$HOME/.npm-pkg"],
    ["NPM_HOME_BIN", "$NPM_HOME/bin"]
  );
  await mkdir(nodeEtcPath, { recursive: true });
  await writeFile(npmrcPath, "prefix=${NPM_HOME}", "utf-8");
}
