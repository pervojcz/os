import { enableRpmfusion } from "./all/rpmfusion";
import { installCodecs } from "./graphical/codecs";
import { installMiscPackages } from "./graphical/misc-packages";

export default async function runSharedScriptsGraphical() {
  // await tools.packages.upgrade();

  await enableRpmfusion();
  await installMiscPackages();
  await installCodecs();
}
