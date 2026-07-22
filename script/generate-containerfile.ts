import { exists, mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { generateContainerfile } from "../src/utils/generate-containerfile";
import { importVariantFromArgs } from "../src/utils/import-variant";

const repoRoot = dirname(__dirname);

const { variantName, metadata, tasks } = await importVariantFromArgs();
const taskNames = tasks.map((t) => t.name);
const hasReadme = await exists(join(metadata.baseDirectory, "README.md"));

const imageNamePrefix = process.env.IMAGE_NAME?.toLocaleLowerCase() ?? "os";
const imageRegistry = process.env.IMAGE_REGISTRY?.toLocaleLowerCase();

const repo = process.env.GH_REPO;
const commitSha = process.env.GITHUB_SHA?.slice(0, 7);
const refType = process.env.GH_REF_TYPE;
const refName = process.env.GH_REF_NAME ?? "main";
const prId = process.env.GH_PR;

function getLocalTags() {
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

  return labels.map(([key, value]) => `${key}=${value}`);
}

function getRegistryTags(localTags: string[]) {
  if (!imageRegistry) return localTags;
  return localTags.map((tag) => `${imageRegistry}/${tag}`);
}

if (imageRegistry && !(await exists(join(repoRoot, "cosign.pub")))) {
  console.error(
    "IMAGE_REGISTRY is set but cosign.pub is missing at the repository root",
  );
  process.exit(1);
}

const containerfileRel = join(".generated", variantName, "Containerfile");
const containerfilePath = join(repoRoot, containerfileRel);

await mkdir(dirname(containerfilePath), { recursive: true });
await writeFile(
  containerfilePath,
  generateContainerfile(
    metadata.baseImage,
    variantName,
    taskNames,
    imageRegistry,
  ),
  "utf8",
);

console.log(
  JSON.stringify({
    containerfile: containerfileRel,
    tags: getRegistryTags(getLocalTags()),
    labels: getLabels(),
  }),
);
