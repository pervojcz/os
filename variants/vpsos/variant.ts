import { defineVariant } from "~/define-variant";
import runSharedScriptsServer from "../_shared/server";

const vpsOsVariant = defineVariant({
  name: "vpsos",
  metadata: {
    title: "VPS OS",
    description: "Custom VPS OS image based on Fedora CoreOS",
  },
  baseImage: "quay.io/fedora/fedora-coreos:stable",
  builder: async () => {
    await runSharedScriptsServer();
  },
});

export default vpsOsVariant;
