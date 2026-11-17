import { defineVariant } from "~/define-variant";
import runSharedScriptsGraphical from "../_shared/graphical";
import { setupBitwardenPolkitPolicy } from "./scripts/bitwarden";
import { installFonts } from "./scripts/fonts";
import { installGhostty } from "./scripts/ghostty";
import { createGnomeOverrides } from "./scripts/gnome-overrides";
import { installLenovoLegionLinux } from "./scripts/lenovo-legion-linux";
import { installLogiops } from "./scripts/logiops";
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
  baseImage: "ghcr.io/ublue-os/silverblue-main:latest",
  nvidia: true,
  builder: async () => {
    await runSharedScriptsGraphical();

    await installVirtualizationPackages();

    await installGhostty();

    await installLenovoLegionLinux();
    await installLogiops();
    await installPrinterDrivers();

    await installFonts();
    await createGnomeOverrides();

    await installVscode();

    await setupBitwardenPolkitPolicy();
    await installVicinae();
  },
});

export default circleVariant;
