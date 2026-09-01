export function trimLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
