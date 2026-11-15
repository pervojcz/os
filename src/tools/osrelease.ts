import { readFile, writeFile } from "node:fs/promises";

type OsReleaseQuotingStyle = "none" | "single" | "double";

class OsReleaseEntry {
  private constructor(
    private key_: string,
    private value_: string,
    private quotingStyle: OsReleaseQuotingStyle = "none",
  ) {}

  static parse(line: string): OsReleaseEntry | null {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) return null;

    const key = match[1];
    let value = match[2];
    let quotingStyle: OsReleaseQuotingStyle = "none";

    if (value.startsWith('"')) {
      if (!value.endsWith('"') || value.endsWith('\\"')) return null;
      quotingStyle = "double";
      value = value.slice(1, -1);
    } else if (value.startsWith("'")) {
      if (!value.endsWith("'") || value.endsWith("\\'")) return null;
      quotingStyle = "single";
      value = value.slice(1, -1);
    }

    value = value.replace(/\\(["'`\\$])/g, "$1");

    return new OsReleaseEntry(key, value, quotingStyle);
  }

  static fromKeyValue(key: string, value: string): OsReleaseEntry | null {
    if (!/^[A-Z0-9_]+$/.test(key)) return null;
    if (value.includes("\n")) return null;
    return new OsReleaseEntry(key, value, "double");
  }

  toString(): string {
    let escapedValue = this.value.replace(/(["'`\\$])/g, "\\$1");
    if (this.quotingStyle === "double") {
      escapedValue = `"${escapedValue}"`;
    } else if (this.quotingStyle === "single") {
      escapedValue = `'${escapedValue}'`;
    }
    return `${this.key}=${escapedValue}`;
  }

  get key(): string {
    return this.key_;
  }

  get value(): string {
    return this.value_;
  }
}

export class OsRelease {
  private entries: Map<string, OsReleaseEntry> = new Map();

  static parse(content: string): OsRelease {
    const osRelease = new OsRelease();
    const lines = content.split("\n");
    for (const line of lines) {
      const entry = OsReleaseEntry.parse(line);
      if (entry) {
        osRelease.entries.set(entry["key"], entry);
      }
    }
    return osRelease;
  }

  get(key: string): string | undefined {
    return this.entries.get(key)?.value;
  }

  set(key: string, value: string): boolean {
    const entry = OsReleaseEntry.fromKeyValue(key, value);
    if (!entry) return false;
    this.entries.set(key, entry);
    return true;
  }

  toString(): string {
    return Array.from(this.entries.values())
      .map((entry) => entry.toString() + "\n")
      .join("");
  }
}

export async function readOsReleaseFile(): Promise<OsRelease> {
  const content = await readFile("/usr/lib/os-release", "utf-8");
  return OsRelease.parse(content);
}

export async function writeOsReleaseFile(osRelease: OsRelease): Promise<void> {
  const content = osRelease.toString();
  await writeFile("/usr/lib/os-release", content, "utf-8");
}
