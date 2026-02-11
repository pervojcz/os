import { $ } from "bun";
import { exists, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { generateContainerfile } from "../src/utils/generate-containerfile";
import { importVariantFromArgs } from "../src/utils/import-variant";

const dir = dirname(__dirname);

const { variantName, metadata, tasks } = await importVariantFromArgs();
const taskNames = tasks.map((t) => t.name);
const hasReadme = await exists(join(metadata.baseDirectory, "README.md"));

const registryUser = process.env.REGISTRY_USER;
const registryPassword = process.env.REGISTRY_PASSWORD;

const imageNamePrefix = process.env.IMAGE_NAME?.toLocaleLowerCase() ?? "os";
const imageRegistry = process.env.IMAGE_REGISTRY?.toLocaleLowerCase();
const podmanBuildArgs = (process.env.PODMAN_BUILD_ARGS ?? "")
  .split(/\s+/)
  .filter(Boolean);

const repo = process.env.GH_REPO;
const commitSha = process.env.GITHUB_SHA?.slice(0, 7);
const refType = process.env.GH_REF_TYPE;
const refName = process.env.GH_REF_NAME ?? "main";
const prId = process.env.GH_PR;

function getTags() {
  const tags: string[] = [];
  tags.push(prId ? `pr-${prId}` : "latest");
  if (refType == "tag") tags.push(refName);
  if (commitSha) tags.push(commitSha);
  return tags.map((tag) => `${imageNamePrefix}-${variantName}:${tag}`);
}

function getLabels() {
  const labels: [string, string][] = [];

  labels.push(["org.opencontainers.image.title", metadata.imageTitle]);

  if (metadata.imageDescription) {
    labels.push([
      "org.opencontainers.image.description",
      metadata.imageDescription,
    ]);
  }

  if (repo) {
    labels.push([
      "org.opencontainers.image.source",
      `https://github.com/${repo}`,
    ]);
  }

  if (hasReadme && repo) {
    const ref = commitSha ?? refName;
    const file = `variants/${variantName}/README.md`;
    labels.push([
      "io.artifacthub.package.readme-url",
      `https://raw.githubusercontent.com/${repo}/${ref}/${file}`,
    ]);
  }

  return labels.map((entry) => entry.join("="));
}

const tags = getTags();
const labels = getLabels();

const baseImage = `quay.io/fedora-ostree-desktops/${metadata.baseImageName}:${metadata.baseImageVersion}`;

const containerfilePath = join(
  tmpdir(),
  `os-containerfile-${variantName}-${Date.now()}`,
);

await writeFile(
  containerfilePath,
  generateContainerfile(baseImage, variantName, taskNames),
  "utf8",
);

try {
  await $`
    podman build \
      --file=${containerfilePath} \
      ${podmanBuildArgs}
      ${tags.map((tag) => ["--tag", tag])} \
      ${labels.map((label) => ["--label", label])} \
      ${dir}
  `;
} finally {
  await unlink(containerfilePath);
}

if (imageRegistry && registryUser && registryPassword) {
  await $`
    podman login \
      --username="${registryUser}" \
      --password="${registryPassword}" \
      ${imageRegistry}
  `;

  for (const tag of tags) {
    await $`podman push ${tag} ${imageRegistry}/${tag}`;
  }
}
