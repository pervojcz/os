import { getVariantCtx } from "./get-variant-ctx";

type PromiseOr<T> = T | Promise<T>;

export type VariantCtx = Awaited<ReturnType<typeof getVariantCtx>>;
export type VariantTaskCallback = (input: VariantCtx) => PromiseOr<void>;

export type VariantTask = {
  name: string;
  callback: VariantTaskCallback;
};

type ResolvedVariantTask = VariantTask & {
  baseDirectory: string;
};

export type VariantMetadata = {
  baseImageName: string;
  baseImageVersion: string;
  baseDirectory: string;
  imageTitle: string;
  imageDescription?: string;
};

export function createTask(name: string, callback: VariantTaskCallback): VariantTask {
  if (!name.trim()) {
    throw new Error("Task name must not be empty.");
  }

  if (!/^[a-z0-9][a-z0-9-._]*$/.test(name)) {
    throw new Error(
      `Invalid task name \"${name}\". Task names must match /^[a-z0-9][a-z0-9-._]*$/.`,
    );
  }

  return { name, callback };
}

export function createVariant(
  metadata: VariantMetadata,
  tasks: VariantTask[],
  inheritedTasks: ResolvedVariantTask[] = []
) {
  const localTasks = tasks.map((task) => ({
    ...task,
    baseDirectory: metadata.baseDirectory,
  }));

  const resolvedTasks = [...inheritedTasks, ...localTasks];
  assertUniqueTaskNames(metadata, resolvedTasks);
  const ctxCache = new Map<string, VariantCtx>();

  async function runTask(task: ResolvedVariantTask) {
    let ctx = ctxCache.get(task.baseDirectory);

    if (!ctx) {
      ctx = await getVariantCtx(task.baseDirectory);
      ctxCache.set(task.baseDirectory, ctx);
    }

    await task.callback(ctx);
  }

  async function buildVariant() {
    for (const task of resolvedTasks) {
      await runTask(task);
    }
  }

  async function buildTask(taskName: string) {
    const task = resolvedTasks.find((entry) => entry.name === taskName);

    if (!task) {
      const validTasks = resolvedTasks.map((entry) => entry.name).join(", ") || "none";
      throw new Error(
        `Unknown task \"${taskName}\" for variant \"${metadata.imageTitle}\". Valid tasks: ${validTasks}`,
      );
    }

    await runTask(task);
  }

  function extend(
    extMetadata: Omit<VariantMetadata, "baseImageName" | "baseImageVersion">,
    extTasks: VariantTask[]
  ) {
    return createVariant({ ...metadata, ...extMetadata }, extTasks, resolvedTasks);
  }

  return {
    metadata,
    tasks: resolvedTasks.map(({ name, callback }) => ({ name, callback })),
    buildVariant,
    buildTask,
    extend,
  };
}

export type Variant = ReturnType<typeof createVariant>;

function assertUniqueTaskNames(metadata: VariantMetadata, tasks: ResolvedVariantTask[]) {
  const duplicateNames = new Set<string>();
  const seen = new Set<string>();

  for (const task of tasks) {
    if (seen.has(task.name)) {
      duplicateNames.add(task.name);
      continue;
    }

    seen.add(task.name);
  }

  if (duplicateNames.size > 0) {
    throw new Error(
      `Duplicate task names found for variant \"${metadata.imageTitle}\": ${Array.from(
        duplicateNames,
      ).join(", ")}`,
    );
  }
}
