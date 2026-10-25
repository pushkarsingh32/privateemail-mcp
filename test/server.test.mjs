import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SERVER = fileURLToPath(new URL("../index.mjs", import.meta.url));

// Runs the real server over stdio with no password configured, so no test touches the network.
async function callServer(requests) {
  const child = spawn(process.execPath, [SERVER], {
    env: { PATH: process.env.PATH, EMAIL_ADDRESS: "nobody@example.test", EMAIL_KEYCHAIN_SERVICE: "privateemail-mcp-test-missing" },
    stdio: ["pipe", "pipe", "inherit"],
  });
  const lines = [];
  child.stdout.on("data", (chunk) => lines.push(...chunk.toString().split("\n").filter(Boolean)));

  const send = (message) => child.stdin.write(`${JSON.stringify(message)}\n`);
  send({ jsonrpc: "2.0", id: 0, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } } });
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  requests.forEach((request, i) => send({ jsonrpc: "2.0", id: i + 1, ...request }));

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline && lines.length < requests.length + 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  child.kill();
  const byId = new Map(lines.map((l) => JSON.parse(l)).map((m) => [m.id, m]));
  return requests.map((_, i) => byId.get(i + 1));
}

test("lists the six mail tools and no delete tool", async () => {
  const [response] = await callServer([{ method: "tools/list" }]);
  const names = response.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["list_folders", "mark_read", "move_messages", "read_message", "search_messages", "send_email"]);
});

test("a missing password is reported as a tool error, not a crash", async () => {
  const [response] = await callServer([{ method: "tools/call", params: { name: "list_folders", arguments: {} } }]);
  assert.equal(response.result.isError, true);
  assert.match(response.result.content[0].text, /password/i);
});

test("send_email rejects an invalid recipient before any network call", async () => {
  const [response] = await callServer([
    { method: "tools/call", params: { name: "send_email", arguments: { to: ["not-an-email"], subject: "x", text: "x" } } },
  ]);
  assert.match(JSON.stringify(response), /Invalid email address/);
});
