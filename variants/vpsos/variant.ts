import { defineVariant } from "~/define-variant";
import { enableRpmfusion } from "../_shared/rpmfusion";
import { installGhosttyTerminfo } from "./scripts/ghostty-terminfo";

const vpsOsVariant = defineVariant({
  name: "vpsos",
  metadata: {
    title: "VPS OS",
    description: "Custom VPS OS image based on Fedora CoreOS",
  },
  baseImage: "quay.io/fedora/fedora-coreos:stable",
  builder: async () => {
    await enableRpmfusion();
    await installGhosttyTerminfo();
  },
});

export default vpsOsVariant;
