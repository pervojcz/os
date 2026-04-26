import { createTaskGetter } from "~/utils/create-variant";
import { preferRpmfusionBaseurlOverMetalink } from "~/utils/repos";

export const getRpmfusionTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    `https://ftp.fi.muni.cz/pub/linux/rpmfusion/free/fedora/rpmfusion-free-release-${ctx.fedoraVersion}.noarch.rpm`,
    `https://ftp.fi.muni.cz/pub/linux/rpmfusion/nonfree/fedora/rpmfusion-nonfree-release-${ctx.fedoraVersion}.noarch.rpm`,
  );
  await preferRpmfusionBaseurlOverMetalink();
});
