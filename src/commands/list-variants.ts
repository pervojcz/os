import variants from "../../variants/variants";

export async function listVariants(args: { nvidia?: boolean }) {
  console.log(JSON.stringify(variants.list(args.nvidia)));
}
