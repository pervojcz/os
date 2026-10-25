import { enableRpmfusion } from "./all/rpmfusion";
import { installGhosttyTerminfo } from "./server/ghostty-terminfo";

export default async function runSharedScriptsServer() {
  // await tools.packages.upgrade();

  await enableRpmfusion();
  await installGhosttyTerminfo();
}
