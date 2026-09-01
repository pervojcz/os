import { $ } from "bun";

export async function cloneRepo(url: string, directory?: string) {
  directory ??= getDir(url);
  console.log(`Cloning Git repository ${url} into ${directory}`);
  await $`git clone ${url} ${directory}`;
}

function getDir(url: string) {
  return url
    .split("/")
    .pop()!
    .replace(/\.git$/, "");
}
