import { $ } from "bun";

export type UrlProtocol = `http${"s" | ""}://`;
export type Url = `${UrlProtocol}${string}`;

export async function downloadFile(url: string, outputPath: string) {
  console.log(`Downloading file from ${url} to ${outputPath}`);
  return await $`curl -fsSL ${url} -o ${outputPath}`;
}
