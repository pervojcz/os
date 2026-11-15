import type { VariantConfig } from "~/define-variant";
import tools from "~/tools";
import variants from "../../variants/variants";

export async function runBuilder(variantName: string, nvidia: boolean) {
  if (!(variantName in variants)) {
    console.error(`Variant ${variantName} not found`);
    process.exit(1);
  }

  const variant = variants[variantName as keyof typeof variants];

  if (nvidia) return installNvidiaDrivers(variant);

  console.info(`Running builder for variant ${variant.name}...`);
  await variant.builder();
}

async function installNvidiaDrivers(variant: VariantConfig) {
  if (!variant.nvidia) {
    console.error(
      `Variant ${variant.name} does not support NVIDIA drivers installation`,
    );
    return process.exit(1);
  }

  console.info(`Installing NVIDIA drivers for variant ${variant.name}...`);
  tools.ublue.installNvidiaDrivers();
}
