import { readdir } from "fs/promises";
import { dirname, join } from "path";
import type { Variant } from "./create-variant";

type ImportVariantFromArgsOptions = {
  allowTaskName?: boolean;
  requireTaskName?: boolean;
};

export async function importVariant(variantName: string) {
  type Module = {
    default: Variant;
  };

  const normalizedVariantName = variantName.trim();

  if (!normalizedVariantName) {
    throw new Error(
      "Missing required argument <variantName>. Example: bun src/start-script.ts <variantName>",
    );
  }

  const availableVariants = await listAvailableVariants();

  if (!availableVariants.includes(normalizedVariantName)) {
    throw new Error(
      `Unknown variant \"${normalizedVariantName}\". Valid variants: ${availableVariants.join(", ") || "none"}`,
    );
  }

  const config = (await import(
    `../../variants/${normalizedVariantName}/variant.ts`
  )) as Module;

  return config.default;
}

export async function importVariantFromArgs(
  options: ImportVariantFromArgsOptions = {},
) {
  const { allowTaskName = false, requireTaskName = false } = options;
  const args = process.argv.slice(2);
  const [variantName, taskName, ...rest] = args;

  if (!variantName) {
    throw new Error(
      "Missing required argument <variantName>. Example: bun src/start-script.ts <variantName>",
    );
  }

  if (!allowTaskName && taskName) {
    throw new Error(
      "Unexpected <taskName> argument. This command only accepts <variantName>.",
    );
  }

  if (requireTaskName && !taskName) {
    throw new Error(
      "Missing required argument <taskName>. Example: bun src/run-task.ts <variantName> <taskName>",
    );
  }

  if (rest.length > 0) {
    throw new Error(`Unexpected extra arguments: ${rest.join(" ")}`);
  }

  const variant = await importVariant(variantName);

  return { variantName, taskName, ...variant };
}

async function listAvailableVariants() {
  const variantsDirectory = join(dirname(dirname(__dirname)), "variants");
  const entries = await readdir(variantsDirectory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
