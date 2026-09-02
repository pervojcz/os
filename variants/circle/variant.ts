import { defineVariant } from "~/define-variant";
import runSharedScripts from "../_shared";
import { setupBitwardenPolkitPolicy } from "./scripts/bitwarden";
import { installCursor } from "./scripts/cursor";
import { installFonts } from "./scripts/fonts";
import { installGhostty } from "./scripts/ghostty";
import { createGnomeOverrides } from "./scripts/gnome-overrides";
import { installHowdy } from "./scripts/howdy";
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

    await installGhostty();
    await installMise();

    await installLenovoLegionLinux();
    await installLogiops();
    await installPrinterDrivers();

    await installFonts();
    await createGnomeOverrides();

    await installVscode();
    await installCursor();
    await installOpencode();

    await setupBitwardenPolkitPolicy();
    await installHowdy();
    // await installAuthFace();
    await installVicinae();
  },
});

export default circleVariant;
