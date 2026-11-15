import { $ } from "bun";

type Labels = Record<string, string | undefined>;

export async function getLabels(baseImage: string) {
  const manifest = await $`skopeo inspect docker://${baseImage}`.json();
  return (manifest.Labels ?? {}) as Labels;
}

export async function assertBootableImage(
  baseImage: string,
  defaultLabels?: Labels,
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

export async function getImageVersions(
  baseImage: string,
  defaultLabels?: Labels,
) {
  const labels = defaultLabels ?? (await getLabels(baseImage));
  return {
    image: labels["org.opencontainers.image.version"],
    kernel: labels["ostree.linux"],
  };
}
