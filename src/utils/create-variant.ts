import { getVariantCtx } from "./get-variant-ctx";

type PromiseOr<T> = T | Promise<T>;

export type VariantCtx = Awaited<ReturnType<typeof getVariantCtx>>;
export type VariantTaskCallback = (ctx: VariantCtx) => PromiseOr<void>;

export type VariantTask<N extends string> = {
  name: N;
  callback: VariantTaskCallback;
};

type ResolvedVariantTask<N extends string> = VariantTask<N> & {
  baseDirectory: string;
};

export type VariantMetadata<N extends string> = {
  name: N;
  baseImage: `${string}:${string}`;
  baseImageVariant: string;
  baseDirectory: string;
  imageTitle: string;
  imageDescription?: string;
};

export function createTask<N extends string>(
  name: N,
  callback: VariantTaskCallback,
) {
  if (!name.trim()) {
    throw new Error("Task name must not be empty.");
  }

  if (!/^[a-z0-9][a-z0-9-._]*$/.test(name)) {
    throw new Error(
      `Invalid task name \"${name}\". Task names must match /^[a-z0-9][a-z0-9-._]*$/.`,
    );
  }

  return { name, callback } as VariantTask<N>;
}

export function createTaskGetter<Args extends unknown[]>(
  callback: (ctx: VariantCtx, ...args: Args) => PromiseOr<void>,
) {
  function getTask<N extends string>(name: N, ...args: Args) {
    return createTask(name, (ctx) => callback(ctx, ...args));
  }

  return getTask;
}

export function mergeTasks<N extends string>(
  name: N,
  tasks: readonly VariantTask<string>[],
) {
  return createTask(name, async (ctx) => {
    for (const task of tasks) {
      await task.callback(ctx);
    }
  });
}

export function createVariant<
  VariantName extends string,
  TaskName extends string,
  InheritedTaskName extends string = never,
>(
  metadata: VariantMetadata<VariantName>,
  tasks: VariantTask<TaskName>[],
  inheritedTasks: ResolvedVariantTask<InheritedTaskName>[] = [],
) {
  const localTasks = tasks.map((task) => {
    type TaskName = typeof task.name;
    return {
      ...task,
      baseDirectory: metadata.baseDirectory,
    } as ResolvedVariantTask<TaskName>;
  });

  const resolvedTasks: ResolvedVariantTask<string>[] = [
    ...inheritedTasks,
    ...localTasks,
  ];

  assertUniqueTaskNames(metadata, resolvedTasks);
  const ctxCache = new Map<string, VariantCtx>();

  async function runTask(task: ResolvedVariantTask<string>) {
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
      const validTasks =
        resolvedTasks.map((entry) => entry.name).join(", ") || "none";
      throw new Error(
        `Unknown task \"${taskName}\" for variant \"${metadata.imageTitle}\". Valid tasks: ${validTasks}`,
      );
    }

    await runTask(task);
  }

  function extend<ExtVariantName extends string, ExtTaskName extends string>(
    extMetadata: Omit<
      VariantMetadata<ExtVariantName>,
      "baseImage" | "baseImageVariant"
    >,
    omitedTasks: `${VariantName}.${TaskName}`[],
    extTasks: VariantTask<ExtTaskName>[],
  ) {
    return createVariant(
      { ...metadata, ...extMetadata },
      extTasks,
      resolvedTasks
        .map((task) => {
          type TaskName = typeof task.name;
          type NewTaskName = `${VariantName}.${TaskName}`;

          return {
            ...task,
            name: `${metadata.name}.${task.name}`,
          } as ResolvedVariantTask<NewTaskName>;
        })
        .filter((task) => !(omitedTasks as string[]).includes(task.name)),
    );
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

function assertUniqueTaskNames(
  metadata: VariantMetadata<string>,
  tasks: ResolvedVariantTask<string>[],
) {
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
