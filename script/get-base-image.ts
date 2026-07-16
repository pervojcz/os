import { importVariantFromArgs } from "~/utils/import-variant";

const { metadata } = await importVariantFromArgs();

const parts = metadata.baseImage.split(":");

const version = parts.pop();
const name = parts.join(":");

console.log(
  JSON.stringify({
    name,
    version,
    variant: metadata.baseImageVariant,
  }),
);
