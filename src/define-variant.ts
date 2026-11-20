export type VariantConfig = {
  name: string;
  baseImage: string;
  metadata?: {
    title?: string;
    description?: string;
    icon?: string;
  };
  nvidia?: boolean;
  maxLayers?: number;
};

export const defineVariant = (
  config: VariantConfig & {
    builder: () => Promise<void>;
  },
) => config;

export type Variant = ReturnType<typeof defineVariant>;
