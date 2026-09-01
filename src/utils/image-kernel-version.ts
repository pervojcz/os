import { $ } from "bun";

export async function getImageKernelVersion(baseImage: string) {
  const manifest = await $`skopeo inspect docker://${baseImage}`.json();
  const labels = manifest.Labels ?? ({} as Record<string, string>);

  const isBootcImage = labels["containers.bootc"] === "1";
  const isBootable = labels["ostree.bootable"] === "true";

  if (!isBootcImage || !isBootable) {
    throw new Error(
      `The base image ${baseImage} is not a bootable image. Please use a bootable base image.`,
    );
  }

  const kernelVersion = labels["ostree.linux"];

  if (!kernelVersion) {
    throw new Error(
      `The base image ${baseImage} does not have a kernel version label. Please use a bootable base image with a kernel version.`,
    );
  }

  return kernelVersion;
}
