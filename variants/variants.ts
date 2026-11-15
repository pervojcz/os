import type { Variant } from "~/define-variant";
import circleVariant from "./circle/variant";
import tvOsVariant from "./tvos/variant";
import vpsOsVariant from "./vpsos/variant";

class VariantsMap {
  private constructor(private variants: Record<string, Variant>) {}

  static builder() {
    const variants: Record<string, Variant> = {};

    const builder = {} as {
      variant: (variant: Variant) => typeof builder;
      build: () => VariantsMap;
    };

    builder.variant = (variant: Variant) => {
      if (variant.name in variants) {
        throw new Error(`Variant ${variant.name} already exists`);
      }

      variants[variant.name] = variant;
      return builder;
    };

    builder.build = () => new VariantsMap(variants);

    return builder;
  }

  get(variantName?: string) {
    if (!variantName || !(variantName in this.variants)) return null;
    return this.variants[variantName];
  }

  list(nvidiaOnly = false) {
    return Object.values(this.variants)
      .filter((variant) => (nvidiaOnly ? variant.nvidia : true))
      .map((variant) => variant.name);
  }
}

const variants = VariantsMap.builder()
  .variant(circleVariant)
  .variant(tvOsVariant)
  .variant(vpsOsVariant)
  .build();

export default variants;
