import { importVariantFromArgs } from "./utils/import-variant";

const { buildTask, taskName } = await importVariantFromArgs({
  allowTaskName: true,
  requireTaskName: true,
});

if (!taskName) {
  throw new Error(
    "Missing required argument <taskName>. Example: bun src/run-task.ts <variantName> <taskName>",
  );
}

await buildTask(taskName);
