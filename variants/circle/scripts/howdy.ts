import tools from "~/tools";

export async function installHowdy() {
  await tools.repos.addRepositoryFromCopr("principis/howdy");
  await tools.packages.installPackages("howdy");
}
