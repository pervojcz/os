import { join } from "node:path";
import tools from "~/tools";

export async function installGhosttyTerminfo() {
  const {
    architecture: { kernel: arch },
  } = await tools.fedora.getFedoraInfo();

  const repo = await tools.repos.addRepositoryFromCopr("scottames/ghostty");
  const pkgs = await tools.packages.downloadPackages("ghostty");
  const rpm = pkgs.find((pkg) => pkg.endsWith(`.${arch}.rpm`));
  if (!rpm) throw new Error("Failed to download ghostty RPM for architecture");
  await tools.repos.removeRepository(repo);

  const tmpDir = await tools.files.createTmpDir("ghostty-terminfo");
  await tools.packages.extractPackage(rpm, tmpDir);

  console.log("Installing ghostty terminfo");
  await tools.files.copyFromDir(
    join(tmpDir, "usr", "share", "terminfo"),
    "/usr/share/terminfo",
  );
}
