import { getVariantCtx } from "./get-variant-ctx";

type PromiseOr<T> = T | Promise<T>;

export type VariantCtx = Awaited<ReturnType<typeof getVariantCtx>>;
export type VariantFunction = (input: VariantCtx) => PromiseOr<void>;

export type VariantMetadata = {
  baseImageName: string;
  baseImageVersion: string;
  baseDirectory: string;
  imageTitle: string;
  imageDescription?: string;
};

export function createVariant(
  metadata: VariantMetadata,
  variant: VariantFunction
) {
  async function buildVariant() {
    const ctx = await getVariantCtx(metadata.baseDirectory);
    return await variant(ctx);
  }

  function extend(
    extMetadata: Omit<VariantMetadata, "baseImageName" | "baseImageVersion">,
    extVariant: VariantFunction
  ) {
    return createVariant({ ...metadata, ...extMetadata }, async (ctx) => {
      await buildVariant();
      await extVariant(ctx);
    });
  }

  return { metadata, buildVariant, extend };
}

export type Variant = ReturnType<typeof createVariant>;
