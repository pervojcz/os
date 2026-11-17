import variants from "../../variants/variants";

export async function getBaseImage(args: { variant?: string }) {
  const variant = variants.get(args.variant);
  if (!variant) {
    console.error(`Variant ${args.variant} not found`);
    process.exit(1);
  }

  console.log(variant.baseImage);
}
