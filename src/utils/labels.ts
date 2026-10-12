import { $ } from "bun";

export async function getLabels(baseImage: string) {
  const manifest = await $`skopeo inspect docker://${baseImage}`.json();
  return manifest.Labels ?? ({} as Record<string, string>);
}

export async function assertBootableImage(
  baseImage: string,
  defaultLabels?: Record<string, string>,
) {
  const labels = defaultLabels ?? (await getLabels(baseImage));

  function checkTruthy(value: string | undefined): boolean {
    return value === "1" || value === "true";
  }

  const isBootcImage = checkTruthy(labels["containers.bootc"]);
  const isBootable = checkTruthy(labels["ostree.bootable"]);

  if (!isBootcImage || !isBootable) {
    throw new Error(
      `The base image ${baseImage} is not a bootable image. Please use a bootable base image.`,
    );
  }
}

export async function getImageKernelVersion(
  baseImage: string,
  defaultLabels?: Record<string, string>,
) {
  const labels = defaultLabels ?? (await getLabels(baseImage));
  return labels["ostree.linux"] ?? null;
}
