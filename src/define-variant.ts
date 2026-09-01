export type VariantConfig = {
  name: string;
  baseImage: string;
  metadata?: {
    title?: string;
    description?: string;
    icon?: string;
  };
};

export const defineVariant = (
  config: VariantConfig & {
    builder: () => Promise<void>;
  },
) => config;
