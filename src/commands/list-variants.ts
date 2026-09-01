import variants from "../../variants/variants";

export async function listVariants() {
  console.log(JSON.stringify(Object.keys(variants)));
}
