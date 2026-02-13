import { $ } from "bun";
import { writeFile } from "fs/promises";
import { join } from "node:path";
import { downloadFile, type Url } from "./download-file";
import { getTempDir } from "./temp";
import { trimLines } from "./trim-lines";

export async function addRepositoryFromUrl(url: `${Url}.repo`) {
  const fileName = url.split("/").reverse().shift()!;
  const outputPath = join(getTempDir("repo", fileName), fileName);

  console.log("Downloading repository:", fileName);
  await downloadFile(url, outputPath);
  await addRepositoryFromFile(fileName, outputPath);
}

export async function addRepositoryFromString(
  fileName: string,
  content: string,
) {
  const outputPath = join(getTempDir("repo", fileName), fileName);

  console.log("Writing repository:", fileName);
  await writeFile(outputPath, trimLines(content), { encoding: "utf8" });
  await addRepositoryFromFile(fileName, outputPath);
}

export async function addRepositoryFromFile(
  fileName: string,
  filePath: string,
) {
  console.log("Installing repository:", fileName);
  await $`install -o 0 -g 0 -m644 ${filePath} ${`/etc/yum.repos.d/${fileName}`}`;
}

export async function addRepositoryFromCopr(
  copr: `${string}/${string}`,
  fedoraVersion: string,
) {
  const [org, repo] = copr.split("/");
  console.log("Adding Copr repository:", org, repo);
  await addRepositoryFromUrl(
    `https://copr.fedorainfracloud.org/coprs/${org}/${repo}/repo/fedora-${fedoraVersion}/${org}-${repo}-fedora-${fedoraVersion}.repo`,
  );
}

export function getAddRepositoryFromCoprFunction(fedoraVersion: string) {
  return (copr: `${string}/${string}`) => {
    return addRepositoryFromCopr(copr, fedoraVersion);
  };
}
