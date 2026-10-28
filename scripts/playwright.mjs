import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const cliPath = resolve(repositoryRoot, "node_modules", "@playwright", "test", "cli.js");

// Keep the browser cache inside the ignored workspace directory so install and
// test use the same location on Windows, macOS, Linux, and CI.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(repositoryRoot, ".playwright-browsers");

const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
