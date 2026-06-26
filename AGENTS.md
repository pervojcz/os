# AGENTS.md
Guidance for coding agents working in this repository.

## Scope
- Applies to the whole repository rooted at `os/`.
- Follow repository patterns over generic preferences.
- Keep changes focused and minimal; avoid broad refactors unless requested.
- Never revert unrelated local edits in a dirty worktree.

## Repository Overview
- Stack: Bun + TypeScript (`type: module`).
- Purpose: build Fedora-based OS image variants.
- CI workflows: `.github/workflows/build.yml`, `.github/workflows/iso.yml`.
- Core scripts: `script/`.
- Variants: `variants/*/variant.ts`.
- Shared helpers: `src/utils/`.

## Important Files
- `package.json` (no npm scripts).
- `tsconfig.json` (`strict: true`, bundler module resolution, ESNext target).
- `.editorconfig` (2 spaces, LF, trim trailing whitespace, final newline).
- `Containerfile` (base image build contract).
- `src/start-script.ts` and `src/run-script.sh` (variant execution path).

## Cursor / Copilot Rules
- No `.cursor/rules/` directory exists.
- No `.cursorrules` file exists.
- No `.github/copilot-instructions.md` file exists.
- If these appear later, treat them as higher-priority guidance.

## Setup
- Install dependencies: `bun install`
- Confirm runtime: `bun --version`
- Quick sanity check: `bun script/list-variants.ts`

## Build, Lint, and Test Commands
This repository uses direct Bun/TS commands (not package scripts).

### Build Commands
- List variants: `bun script/list-variants.ts`
- Resolve base image metadata: `bun script/get-base-image.ts <variant>`
- Generate Containerfile for CI: `bun script/generate-containerfile.ts <variant>`
- Run variant logic directly: `bun src/start-script.ts <variant>`

### Lint / Format / Typecheck
- Type-check: `bunx tsc --noEmit`
- ESLint: no committed config currently.
- Prettier: no committed config currently.
- Formatting baseline: `.editorconfig` + existing file style.

### Test Commands
- Current state: no `*.test.*` / `*.spec.*` tests are committed.
- Default runner (likely zero tests): `bun test`

### Single-Test Guidance
- There is no current test suite to target a single test.
- If tests are added, run one file: `bun test path/to/file.test.ts`
- Filter by test name: `bun test path/to/file.test.ts -t "test name"`
- Current closest focused validation: `bun script/get-base-image.ts <variant>`

## CI Behavior Summary
- `build.yml`
  - computes variant matrix via `script/list-variants.ts`
  - generates Containerfile via `script/generate-containerfile.ts`, then builds with Blacksmith Docker actions
- `iso.yml`
  - installs dependencies with `bun install`
  - gets base image via `script/get-base-image.ts`
  - builds ISO and uploads artifacts
  - uploads outputs via `script/upload-file.ts`

## Environment Variables Used
Build-related:
- `REGISTRY_USER`
- `REGISTRY_PASSWORD`
- `IMAGE_NAME`
- `IMAGE_REGISTRY`
- `GH_REPO`
- `GH_REF_TYPE`
- `GH_REF_NAME`
- `GH_PR`
ISO upload-related:
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`

## Code Style Guidelines

### Formatting
- Use 2-space indentation.
- Use LF line endings.
- Trim trailing whitespace.
- End files with a newline.

### Imports
- Keep imports at the top of files.
- Preferred grouping:
  - Bun/native modules
  - external Node modules
  - local relative imports
- Use `import type` for type-only imports.
- Respect `~/*` alias usage from `tsconfig.json` when established.

### TypeScript and Types
- Keep compatibility with strict TS settings.
- Prefer explicit types on exported APIs.
- Avoid `any`; use concrete, union, or generic types.
- Prefer `type` aliases unless `interface` extension is needed.
- Reuse patterns like `Awaited<ReturnType<...>>`.
- Use template literal types when they improve safety.

### Naming Conventions
- Filenames: kebab-case (example: `import-variant.ts`).
- Variables/functions: `camelCase`.
- Types: `PascalCase`.
- Use descriptive domain-oriented names (`variantName`, `baseImageVersion`).

### Error Handling and Logging
- Validate required CLI args early; fail non-zero on invalid input.
- Wrap failure-prone shell operations in `try/catch` when needed.
- For Bun shell failures, log context and rethrow typed `ShellError`.
- Do not silently swallow errors.
- Keep logs concise and useful.

### Async and Shell Execution
- Prefer async/await over promise chains.
- Use Bun shell templates (`$\`...\``) consistently.
- Parameterize shell args; avoid manual command string concatenation.
- Avoid unsafe parallel side effects unless intentionally coordinated.

### Variant Patterns
- Define variants with `createVariant(metadata, async (ctx) => { ... })`.
- Keep metadata complete: `baseImageName`, `baseImageVersion`, `baseDirectory`, `imageTitle`.
- Use optional `imageDescription` when available.
- Reuse context helpers (`ctx.installPackages`, `ctx.copyFiles`, etc.).
- Prefer `extend(...)` over duplicating variant logic.

### Shell / Containerfile Conventions
- In shell scripts, keep strict mode: `set -ouex pipefail`.
- Quote variable expansions unless unquoted expansion is intentional.
- Preserve `ostree container commit` at end of each `RUN` block.
- Do not change Containerfile build args contract (`BASE_IMAGE`, `VARIANT_NAME`) without cause.

## Validation Checklist
- `bun install` (if deps or lockfile changed)
- `bunx tsc --noEmit` (for TS changes)
- `bun script/list-variants.ts` (variant discovery changes)
- `bun script/get-base-image.ts <variant>` (variant metadata changes)
- `bun script/generate-containerfile.ts <variant>` (build-path changes)

## Commit Guidance
- Keep commits focused and atomic.
- Commit messages should explain why, not only what.
- Match recent repository commit message style (prefixes, tense, and scope).
- Never commit secrets or environment-specific credentials.
- Do not amend commits unless explicitly requested.

## When Unsure
- Mirror existing patterns in `src/utils/` and `variants/`.
- Follow CI command flow in workflow files.
- Choose the smallest safe change that solves the task.

## Updating This File
- When you learn something new about this repository (commands, conventions, gotchas, or tooling), update AGENTS.md so future agents benefit. Add or adjust the relevant section; keep the file concise.
