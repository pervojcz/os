import tools from "~/tools";

export async function installMise() {
  await tools.repos.addRepositoryFromCopr("jdxcode/mise");
  await tools.packages.installPackages("mise");
}
