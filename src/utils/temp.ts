import { mkdtempSync } from "fs";
import { resolve } from "path";

export function getTempDir(...prefixes: [string, ...string[]]) {
  return resolve(mkdtempSync(`os-src-${prefixes.join("-")}-`));
}
