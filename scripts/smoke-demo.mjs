import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const viteCli = resolve(root, "node_modules/vite/bin/vite.js");
const host = "127.0.0.1";
const port = Number(process.env.VITE_PREVIEW_SMOKE_PORT || 4178);
const baseUrl = "http://" + host + ":" + port;
let exitInfo;
let startError;
const logs = [];

const server = spawn(
  process.execPath,
  [viteCli, "preview", "--host", host, "--port", String(port), "--strictPort"],
  {
    cwd: root,
    env: {
      ...process.env,
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_ANON_KEY: "",
      VITE_SUPABASE_PUBLISHABLE_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

for (const stream of [server.stdout, server.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => logs.push(chunk));
}
server.once("error", (error) => { startError = error; });
const exited = new Promise((resolveExit) => {
  server.once("exit", (code, signal) => {
    exitInfo = { code, signal };
    resolveExit();
  });
});

async function fetchWhenReady(url) {
  const deadline = Date.now() + 15000;
  let lastError;
  while (Date.now() < deadline) {
    if (startError) throw startError;
    if (exitInfo) throw new Error("Vite preview exited before responding: " + JSON.stringify(exitInfo));
    try {
      return await fetch(url, { signal: AbortSignal.timeout(1500) });
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }
  throw new Error("Timed out waiting for Vite preview: " + String(lastError || "no response"));
}

try {
  const page = await fetchWhenReady(baseUrl + "/");
  assert.equal(page.status, 200, "preview root should return HTTP 200");
  assert.match(page.headers.get("content-type") || "", /text\/html/i);
  const html = await page.text();
  assert.match(html, /<title>Wattwise · Energy intelligence<\/title>/);
  assert.match(html, /id="root"/);

  const scriptPath = html.match(/<script[^>]+src="([^"]+\.js)"[^>]*>/)?.[1];
  assert.ok(scriptPath, "built demo should reference its application JavaScript bundle");
  const scriptUrl = new URL(scriptPath, baseUrl);
  assert.equal(scriptUrl.origin, baseUrl, "bundle should be served by the local preview");
  const script = await fetchWhenReady(scriptUrl);
  assert.equal(script.status, 200, "application bundle should return HTTP 200");
  assert.match(script.headers.get("content-type") || "", /javascript/i);
  await script.arrayBuffer();

  console.log("Built demo HTTP smoke check passed without Supabase credentials.");
} catch (error) {
  const output = logs.join("").trim();
  if (output) error.message += "\nVite preview output:\n" + output;
  throw error;
} finally {
  if (server.exitCode === null && server.signalCode === null) {
    server.kill("SIGTERM");
    await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill("SIGKILL");
  }
}
