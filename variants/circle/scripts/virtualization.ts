import tools from "~/tools";

export async function installVirtualizationPackages() {
  await tools.packages.installPackages(
    "virt-install",
    "libvirt-daemon-config-network",
    "libvirt-daemon-kvm",
    "qemu-kvm",
  );
}
