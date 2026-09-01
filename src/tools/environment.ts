import { writeFile } from "node:fs/promises";
import { trimLines } from "~/tools/utils";

export async function createProfileScript(scriptName: string, script: string) {
  console.log(`Creating profile script: ${scriptName}`);
  await writeFile(
    `/etc/profile.d/${scriptName}.sh`,
    trimLines(script),
    "utf-8",
  );
}

type PathEntry = string | { variable?: string; path: string };

export async function addToPath(
  profileScriptName: string,
  ...paths: [PathEntry, ...PathEntry[]]
) {
  const script = getAddToPathSnippet(...paths);
  await createProfileScript(profileScriptName, script);
}

function getAddToPathSnippet(...paths: [PathEntry, ...PathEntry[]]) {
  return paths
    .map((entry) => {
      if (typeof entry === "object" && entry.variable) {
        const { variable, path } = entry;
        const variableSnippet = `export ${variable}=${JSON.stringify(path)}`;
        const snippet = getAddToPathSnippetForSinglePath(`\$${variable}`);
        return `${variableSnippet}\n${snippet}`;
      }

      const path = typeof entry === "string" ? entry : entry.path;
      return getAddToPathSnippetForSinglePath(path);
    })
    .join("\n\n");
}

function getAddToPathSnippetForSinglePath(path: string) {
  return `
case ":$PATH:" in
  *":${path}:"*) ;;
  *) export PATH="$PATH:${path}" ;;
esac
  `;
}
