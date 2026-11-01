import { defineVariant } from "~/define-variant";
import { installPlymouth } from "../_shared/plymouth";
import runSharedScriptsServer from "../_shared/server";
import { setupCompositor } from "./scripts/compositor";

const kioskOsVariant = defineVariant({
  name: "kioskos",
  metadata: {
    title: "Kiosk OS",
    description: "Custom Kiosk OS image based on Fedora IoT",
  },
  baseImage: "quay.io/fedora/fedora-iot:latest",
  builder: async () => {
    await installPlymouth();
    await runSharedScriptsServer();
    await setupCompositor();
  },
});

export default kioskOsVariant;
