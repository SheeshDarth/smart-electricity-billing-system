import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const patterns = [
  ["AWS access key ID", String.raw`AKIA[0-9A-Z]{16}`, "AKIA[0-9A-Z]{16}"],
  ["GitHub token", String.raw`gh[pousr]_[A-Za-z0-9_]{30,}`, "gh[pousr]_[A-Za-z0-9_]{30,}"],
  ["Private key header", String.raw`-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----`, "-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"],
  ["JWT-like token", String.raw`eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}`, "eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}"],
  ["Database URL with embedded password", String.raw`postgres(ql)?://[^\s/:@]+:[^\s@]+@`, "postgres(ql)?://[^[:space:]]+:[^@[:space:]]+@"],
  ["Long secret assignment", String.raw`(api[_-]?key|secret|password|service[_-]?role|access[_-]?token)[\s]*[:=][\s]*['"][A-Za-z0-9_./+=-]{20,}['"]`, `(api[_-]?key|secret|password|service[_-]?role|access[_-]?token)[[:space:]]*[:=][[:space:]]*['"][A-Za-z0-9_./+=-]{20,}['"]`],
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
}

function searchHistory(label, expression) {
  const commits = git(["rev-list", "--all"]).split(/\r?\n/).filter(Boolean);
  const matches = new Set();
  for (let offset = 0; offset < commits.length; offset += 25) {
    const batch = commits.slice(offset, offset + 25);
    const result = spawnSync("git", ["grep", "-I", "-i", "-l", "-E", "-e", expression, ...batch], {
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `git grep failed for ${label}`);
    for (const match of (result.stdout ?? "").split(/\r?\n/).filter(Boolean)) matches.add(match);
  }
  return [...matches].sort();
}

function scanWorkingTree(root, current = root, results = []) {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (entry.isDirectory() && [".git", "node_modules", ".playwright-browsers", "dist", "test-results", "playwright-report"].includes(entry.name)) continue;
    const absolute = join(current, entry.name);
    if (entry.isDirectory()) {
      scanWorkingTree(root, absolute, results);
      continue;
    }
    if (!entry.isFile()) continue;
    const size = statSync(absolute).size;
    if (size > 50 * 1024 * 1024) continue;
    const buffer = readFileSync(absolute);
    if (buffer.includes(0)) continue;
    const content = buffer.toString("utf8");
    for (const [label, expression] of patterns) {
      if (new RegExp(expression, "i").test(content)) results.push({ pattern: label, path: relative(root, absolute).replaceAll("\\", "/") });
    }
  }
  return results;
}

const root = process.cwd();
const currentMatches = scanWorkingTree(root);
const historyMatches = [];
for (const [label, , expression] of patterns) {
  historyMatches.push(...searchHistory(label, expression).map((location) => ({ pattern: label, location })));
}

console.log(JSON.stringify({
  scannedAt: new Date().toISOString(),
  refs: git(["for-each-ref", "--format=%(refname)"]).split(/\r?\n/).filter(Boolean),
  commitCount: git(["rev-list", "--all", "--count"]),
  scannedWorktreeMatches: currentMatches,
  historicalMatches: historyMatches,
  note: "Pattern-based screening only. Match values are never printed. It does not scan GitHub issues, attachments, external services, or secrets outside readable local files.",
}, null, 2));
