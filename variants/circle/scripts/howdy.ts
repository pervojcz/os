import tools from "~/tools";

export async function installHowdy() {
  await tools.repos.addRepositoryFromCopr("principis/howdy-beta");
  await tools.packages.installPackages("howdy");
}
