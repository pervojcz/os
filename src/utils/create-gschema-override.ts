import { $ } from "bun";
import { writeFile } from "fs/promises";

type Override = {
  schema: string;
  overrides: Record<string, string>;
};

export async function createGschemaOverride(
  overrideName: string,
  ...overrides: [Override, ...Override[]]
) {
  const overrideStrings = overrides.map(overrideToString).join("\n\n");
  await $`mkdir -p /usr/share/glib-2.0/schemas`;
  await writeFile(
    `/usr/share/glib-2.0/schemas/99_${overrideName}.gschema.override`,
    overrideStrings,
    "utf-8"
  );
}

function overrideToString(override: Override) {
  const schema = `[${override.schema}]`;
  const overrides = Object.entries(override.overrides)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  return `${schema}\n${overrides}`;
}
