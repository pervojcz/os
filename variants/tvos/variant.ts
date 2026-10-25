import { defineVariant } from "~/define-variant";
import runSharedScriptsServer from "../_shared/server";
import { installKodi } from "./scripts/kodi";

const tvOsVariant = defineVariant({
  name: "tvos",
  metadata: {
    title: "TV OS",
    description: "System for TV that can act as a server too",
  },
  baseImage: "quay.io/fedora/fedora-coreos:stable",
  builder: async () => {
    await runSharedScriptsServer();
    await installKodi();
  },
});

export default tvOsVariant;
