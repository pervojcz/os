import { $ } from "bun";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTmpDir } from "~/tools/files";
import tools from ".";
import { downloadFile, type Url } from "./download";
import { trimLines } from "./utils";

export async function addRepositoryFromUrl(url: `${Url}.repo`) {
  const fileName = url.split("/").reverse().shift()!;
  const tmpDir = await createTmpDir("repo", fileName);
  const outputPath = join(tmpDir, fileName);

  console.log("Downloading repository:", fileName);
  await downloadFile(url, outputPath);
  return await addRepositoryFromFile(fileName, outputPath);
}

export async function addRepositoryFromString(
  fileName: string,
  content: string,
) {
  const tmpDir = await createTmpDir("repo", fileName);
  const outputPath = join(tmpDir, fileName);

  console.log("Writing repository:", fileName);
  await writeFile(outputPath, trimLines(content), { encoding: "utf8" });
  return await addRepositoryFromFile(fileName, outputPath);
}

export async function addRepositoryFromFile(
  fileName: string,
  filePath: string,
) {
  console.log("Installing repository:", fileName);
  const repoPath = join("/etc/yum.repos.d", fileName);
  await $`install -o 0 -g 0 -m644 ${filePath} ${repoPath}`;
  return repoPath;
}

export async function addRepositoryFromCopr(copr: `${string}/${string}`) {
  const [org, repo] = copr.split("/");
  console.log("Adding Copr repository:", org, repo);
  const { fedoraVersion } = await tools.fedora.getFedoraInfo();
  return await addRepositoryFromUrl(
    `https://copr.fedorainfracloud.org/coprs/${org}/${repo}/repo/fedora-${fedoraVersion}/${org}-${repo}-fedora-${fedoraVersion}.repo`,
  );
}

export async function removeRepository(fileName: string) {
  console.log("Removing repository:", fileName);
  const repoPath = join("/etc/yum.repos.d", fileName);
  await $`rm -f ${repoPath}`;
  return repoPath;
}
