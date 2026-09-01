import { defineVariant } from "~/define-variant";
import runSharedScripts from "../_shared";
import { setupBitwardenPolkitPolicy } from "./scripts/bitwarden";
import { installCursor } from "./scripts/cursor";
import { installLenovoLegionLinux } from "./scripts/lenovo-legion-linux";
import { installLogiops } from "./scripts/logiops";
import { installMise } from "./scripts/mise";
import { installOpencode } from "./scripts/opencode";
import { installPrinterDrivers } from "./scripts/printer";
import { installVicinae } from "./scripts/vicinae";
import { installVirtualizationPackages } from "./scripts/virtualization";
import { installVscode } from "./scripts/vscode";

const circleVariant = defineVariant({
  name: "circle",
  metadata: {
    title: "Circle OS",
    description: "Personal OS image based on Fedora Silverblue",
  },
  baseImage: "ghcr.io/ublue-os/silverblue-nvidia:44",
  builder: async () => {
    await runSharedScripts();

    await installVirtualizationPackages();

    await installMise();

    await installLenovoLegionLinux();
    await installLogiops();
    await installPrinterDrivers();

    await installVscode();
    await installCursor();
    await installOpencode();

    await setupBitwardenPolkitPolicy();
    await installVicinae();
  },
});

export default circleVariant;
