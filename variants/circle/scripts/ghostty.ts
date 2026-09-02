import tools from "~/tools";

export async function installGhostty() {
  await tools.repos.addRepositoryFromCopr("scottames/ghostty");
  await tools.packages.installPackages("ghostty");
}
