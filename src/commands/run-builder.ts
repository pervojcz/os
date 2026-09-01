import variants from "../../variants/variants";

export async function runBuilder(variantName: string) {
  if (!(variantName in variants)) {
    console.error(`Variant ${variantName} not found`);
    process.exit(1);
  }

  const variant = variants[variantName as keyof typeof variants];

  console.info(`Running builder for variant ${variantName}...`);
  await variant.builder();
}
