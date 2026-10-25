import { test } from "node:test";
import assert from "node:assert/strict";
import { simpleParser } from "mailparser";
import { buildReply } from "../reply.mjs";

const OWN = "me@example.test";

async function parse(headers, body = "Hello there.\n\nSecond line.") {
  const raw = [
    "Message-ID: <orig-1@mail.example.test>",
    "Date: Thu, 22 Oct 2026 22:57:43 +0000",
    "Subject: Discount code?",
    ...headers,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");
  return simpleParser(raw);
}

test("replies to the sender, keeps the thread and quotes the original", async () => {
  const original = await parse(["From: Sam Buyer <sam@buyer.test>", `To: ${OWN}`]);
  const reply = buildReply(original, { body: "Yes, use CODE10.", ownAddress: OWN });

  assert.deepEqual(reply.to, ["sam@buyer.test"]);
  assert.deepEqual(reply.cc, []);
  assert.equal(reply.subject, "Re: Discount code?");
  assert.equal(reply.inReplyTo, "<orig-1@mail.example.test>");
  assert.equal(reply.references, "<orig-1@mail.example.test>");
  assert.match(reply.text, /^Yes, use CODE10\.\n\nOn Thu, 22 Oct 2026 22:57:43 GMT, "?Sam Buyer"? <sam@buyer\.test> wrote:\n> Hello there\.\n>\n> Second line\.\n$/);
});

test("does not stack Re: prefixes and extends an existing References chain", async () => {
  const original = await parse([
    "From: sam@buyer.test",
    `To: ${OWN}`,
    "Subject: Re: Discount code?",
    "References: <first@mail.example.test> <second@mail.example.test>",
  ]);
  const reply = buildReply(original, { body: "ok", ownAddress: OWN });
  assert.equal(reply.subject, "Re: Discount code?");
  assert.equal(reply.references, "<first@mail.example.test> <second@mail.example.test> <orig-1@mail.example.test>");
});

test("Reply-To wins over From", async () => {
  const original = await parse(["From: noreply@shop.test", "Reply-To: support@shop.test", `To: ${OWN}`]);
  assert.deepEqual(buildReply(original, { body: "ok", ownAddress: OWN }).to, ["support@shop.test"]);
});

test("reply-all copies the others, never ourselves, and never duplicates To", async () => {
  const original = await parse([
    "From: sam@buyer.test",
    `To: ${OWN}, Pat@Team.test`,
    "Cc: sam@buyer.test, lee@team.test",
  ]);
  const reply = buildReply(original, { body: "ok", replyAll: true, ownAddress: OWN });
  assert.deepEqual(reply.to, ["sam@buyer.test"]);
  assert.deepEqual(reply.cc, ["Pat@Team.test", "lee@team.test"]);
});

test("plain reply never copies anyone else", async () => {
  const original = await parse(["From: sam@buyer.test", `To: ${OWN}, pat@team.test`, "Cc: lee@team.test"]);
  assert.deepEqual(buildReply(original, { body: "ok", ownAddress: OWN }).cc, []);
});

test("replying to our own message continues with its recipients", async () => {
  const original = await parse([`From: ${OWN}`, "To: sam@buyer.test"]);
  assert.deepEqual(buildReply(original, { body: "ok", ownAddress: OWN }).to, ["sam@buyer.test"]);
});

test("a message with nobody to reply to is an error", async () => {
  const original = await parse([`From: ${OWN}`, `To: ${OWN}`]);
  // Our own address is the only candidate: allowed (self-send), so use a message with no addresses at all.
  assert.deepEqual(buildReply(original, { body: "ok", ownAddress: OWN }).to, [OWN]);
  const empty = await simpleParser("Message-ID: <x@y.test>\r\nSubject: s\r\n\r\nbody");
  assert.throws(() => buildReply(empty, { body: "ok", ownAddress: OWN }), /no address to reply to/);
});

test("very long originals are shortened in the quote", async () => {
  const original = await parse(["From: sam@buyer.test", `To: ${OWN}`], "x".repeat(6000));
  const reply = buildReply(original, { body: "ok", ownAddress: OWN });
  assert.match(reply.text, /> \[quoted text shortened\]\n$/);
  assert.ok(reply.text.length < 5600);
});
