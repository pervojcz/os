import { defineVariant } from "~/define-variant";
import tools from "~/tools";
import runSharedScripts from "../_shared";

const tvVariant = defineVariant({
  name: "tv",
  metadata: {
    title: "TV OS",
    description: "Custom TV OS image based on Fedora Silverblue",
  },
  baseImage: "ghcr.io/ublue-os/silverblue-main:44",
  builder: async () => {
    await runSharedScripts();
    await tools.packages.installPackages("kodi");
  },
});

export default tvVariant;
