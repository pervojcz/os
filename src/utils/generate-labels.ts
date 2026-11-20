import type { VariantConfig } from "~/define-variant";
import { getGitHubVariables } from "./get-github-variables";

export function generateLabels(variant: VariantConfig) {
  const labels: Record<string, string> = {};
  const gh = getGitHubVariables();

  if (variant.metadata?.title) {
    labels["org.opencontainers.image.title"] = variant.metadata.title;
  }

  if (variant.metadata?.description) {
    labels["org.opencontainers.image.description"] =
      variant.metadata.description;
  }

  if (gh.repo) {
    labels["org.opencontainers.image.source"] = `https://github.com/${gh.repo}`;

    const ref = gh.commitSha ?? gh.refName;
    const file = `variants/${variant.name}/README.md`;
    labels["io.artifacthub.package.readme-url"] =
      `https://raw.githubusercontent.com/${gh.repo}/${ref}/${file}`;
  }

  return labels;
}
