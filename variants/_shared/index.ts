import { installCodecs } from "./codecs";
import { installMiscPackages } from "./misc-packages";
import { enableRpmfusion } from "./rpmfusion";

export default async function runSharedScripts() {
  await enableRpmfusion();
  await installMiscPackages();
  await installCodecs();
}
