import tools from "~/tools";

export async function installVscode() {
  await tools.repos.addRepositoryFromUrl(
    "https://packages.microsoft.com/yumrepos/vscode/config.repo",
  );

  await tools.packages.installPackages("code");
}
