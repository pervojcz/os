import { $ } from "bun";
import { exists, mkdir, mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function list(
  parentDir: string,
  filter?: (f: string) => boolean,
  recursive = false,
) {
  if (!(await exists(parentDir))) return [];
  const files = (await readdir(parentDir, { recursive })).map((f) =>
    join(parentDir, f),
  );
  return filter ? files.filter(filter) : files;
}

export async function copyFromDir(dirToCopyFilesFrom: string, targetDir = "/") {
  console.log(`Copying files: ${dirToCopyFilesFrom} -> ${targetDir}`);
  const files = await list(dirToCopyFilesFrom);
  if (!files.length) return;

  if (!(await exists(targetDir))) {
    await mkdir(targetDir, { recursive: true });
  }

  await $`cp -r ${files} ${targetDir}`;
}

export function createTmpDir(...prefixes: [string, ...string[]]) {
  return mkdtemp(join(tmpdir(), `os-src-${prefixes.join("-")}-`));
}
