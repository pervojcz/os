import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export function getTempDir(...prefixes: [string, ...string[]]) {
  return mkdtempSync(join(tmpdir(), `os-src-${prefixes.join("-")}-`));
}
