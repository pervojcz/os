import { $ } from "bun";
import {
  addToPath,
  getAddToPathSnippet,
  getAddToPathSnippetForSinglePath,
} from "./add-to-path";
import { cloneGitRepo } from "./clone-git-repo";
import { copyFiles } from "./copy-files";
import { createGschemaOverride } from "./create-gschema-override";
import { createProfileScript } from "./create-profile-script";
import { downloadFile } from "./download-file";
import { getLatestReleaseAssets } from "./get-latest-release-assets";
import { listFiles } from "./list-files";
import { installPackages, uninstallPackages } from "./packages";
import {
  addRepositoryFromFile,
  addRepositoryFromString,
  addRepositoryFromUrl,
  getAddRepositoryFromCoprFunction,
} from "./repos";
import { getTempDir } from "./temp";
import { trimLines } from "./trim-lines";

export async function getVariantCtx(baseDirectory: string) {
  const fedoraVersion = (await $`rpm -E %fedora`.text()).trim();

  return {
    addRepositoryFromFile,
    addRepositoryFromString,
    addRepositoryFromUrl,
    addRepositoryFromCopr: getAddRepositoryFromCoprFunction(fedoraVersion),
    addToPath,
    baseDirectory,
    cloneGitRepo,
    copyFiles,
    createGschemaOverride,
    createProfileScript,
    downloadFile,
    fedoraVersion,
    getAddToPathSnippet,
    getAddToPathSnippetForSinglePath,
    getLatestReleaseAssets,
    getTempDir,
    installPackages,
    listFiles,
    trimLines,
    uninstallPackages,
  };
}
