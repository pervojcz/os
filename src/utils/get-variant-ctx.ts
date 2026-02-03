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
import { getReleaseAssets, listReleases } from "./github-releases";
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
  const architecture = (await $`uname -m`.text()).trim();
  const architectureGeneral = getArchitectureGeneral(architecture);

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
    architecture,
    architectureGeneral,
    getAddToPathSnippet,
    getAddToPathSnippetForSinglePath,
    listReleases,
    getReleaseAssets,
    getTempDir,
    installPackages,
    listFiles,
    trimLines,
    uninstallPackages,
  };
}

function getArchitectureGeneral(architecture: string) {
  switch (architecture) {
    case "x86_64":
      return "x64";
    case "aarch64":
      return "arm64";
    default:
      return architecture;
  }
}
