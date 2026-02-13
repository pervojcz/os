import { createTaskGetter } from "~/utils/create-variant";

export const getVirtualizationTask = createTaskGetter(async (ctx) => {
  await ctx.installPackages(
    "virt-install",
    "libvirt-daemon-config-network",
    "libvirt-daemon-kvm",
    "qemu-kvm",
  );
});
