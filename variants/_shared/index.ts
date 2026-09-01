import { installCodecs } from "./codecs";
import { installFonts } from "./fonts";
import { createGnomeOverrides } from "./gnome-overrides";
import { installMiscPackages } from "./misc-packages";
import { enableRpmfusion } from "./rpmfusion";

export default async function runSharedScripts() {
  await enableRpmfusion();
  await installMiscPackages();
  await installCodecs();
  await createGnomeOverrides();
  await installFonts();
}
