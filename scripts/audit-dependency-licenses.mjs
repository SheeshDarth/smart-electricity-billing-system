import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const direct = new Set([
  ...Object.keys(root.dependencies ?? {}),
  ...Object.keys(root.devDependencies ?? {}),
]);
const packages = [];

for (const [location, entry] of Object.entries(lock.packages ?? {})) {
  if (!location.startsWith("node_modules/")) continue;
  let metadata;
  try {
    metadata = JSON.parse(readFileSync(join(location, "package.json"), "utf8"));
  } catch {
    metadata = null;
  }
  const name = metadata?.name ?? location.slice("node_modules/".length);
  const license = metadata?.license
    ?? (Array.isArray(metadata?.licenses) ? metadata.licenses.map((item) => item?.type).filter(Boolean).join(" OR ") : null)
    ?? entry.license
    ?? "UNKNOWN";
  packages.push({ name, version: entry.version ?? metadata?.version ?? "unknown", license, direct: direct.has(name) });
}

const licenseCounts = new Map();
for (const item of packages) licenseCounts.set(item.license, (licenseCounts.get(item.license) ?? 0) + 1);
const unknown = packages.filter((item) => item.license === "UNKNOWN");
console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  packageCount: packages.length,
  directDependencyCount: packages.filter((item) => item.direct).length,
  licenseCounts: Object.fromEntries([...licenseCounts].sort(([left], [right]) => left.localeCompare(right))),
  missingLicenseMetadata: unknown,
}, null, 2));
