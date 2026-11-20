import VariantsMap from "~/variants-map";
import circleVariant from "./circle/variant";
import tvOsVariant from "./tvos/variant";
import vpsOsVariant from "./vpsos/variant";

const variants = VariantsMap.builder()
  .variant(circleVariant)
  .variant(tvOsVariant)
  .variant(vpsOsVariant)
  .build();

export default variants;
