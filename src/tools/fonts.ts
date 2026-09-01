import { $ } from "bun";
import { join } from "node:path";
import tools from ".";

const googleFontsInstallDir = "/usr/share/fonts/google-fonts";

export async function installGoogleFont(fontId: string, subsets?: string[]) {
  const font = await getGoogleFont(fontId, subsets);
  const tmpDir = await tools.files.createTmpDir("fonts", fontId);

  await Promise.all(
    font.variants.map(async (v) => {
      const fontFile = join(
        tmpDir,
        `${font.id}-${v.fontWeight}-${v.fontStyle}.ttf`,
      );

      await tools.download.downloadFile(v.ttf, fontFile);
    }),
  );

  await $`mkdir -p ${googleFontsInstallDir}`.quiet();
  await $`chmod 755 ${googleFontsInstallDir}`.quiet();

  await tools.files.copyFromDir(tmpDir, googleFontsInstallDir);
  await $`chmod 644 ${join(googleFontsInstallDir, "*")}`.quiet();
  await $`fc-cache -f`.quiet();
}

async function getGoogleFont(fontId: string, subsets?: string[]) {
  const url = new URL(fontId, "https://gwfh.mranftl.com/api/fonts/");
  if (subsets) url.searchParams.set("subsets", subsets.join(","));
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch font ${fontId}: ${res.statusText}`);
  }

  return (await res.json()) as {
    id: string;
    family: string;
    subsets: string[];
    defSubset: string;
    variants: Array<{
      fontStyle: string;
      fontWeight: string;
      ttf: string;
    }>;
  };
}
