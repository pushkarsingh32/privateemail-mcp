// Builds a reply to a parsed message (mailparser output): who it goes to, the subject,
// the threading headers and the quoted original, the way a mail client would.
const MAX_QUOTE_CHARS = 5_000;

const addressesOf = (field) => (field?.value ?? []).map((entry) => entry.address).filter(Boolean);

export function buildReply(original, { body, replyAll = false, ownAddress }) {
  const own = ownAddress.toLowerCase();
  const isOwn = (address) => address.toLowerCase() === own;

  const replyTo = addressesOf(original.replyTo);
  let to = replyTo.length ? replyTo : addressesOf(original.from);
  // Replying to a message we sent ourselves continues the conversation with its recipients.
  if (to.length > 0 && to.every(isOwn)) to = addressesOf(original.to);

  const seen = new Set();
  const unseen = (address) => !seen.has(address.toLowerCase()) && seen.add(address.toLowerCase());
  to = to.filter(unseen);
  // Reply-all copies everyone else, but never ourselves or anyone already in To.
  const cc = replyAll
    ? [...addressesOf(original.to), ...addressesOf(original.cc)].filter((a) => !isOwn(a)).filter(unseen)
    : [];
  if (to.length === 0) throw new Error("The original message has no address to reply to");

  const subject = /^re:/i.test(original.subject ?? "") ? original.subject : `Re: ${original.subject ?? ""}`.trimEnd();

  const messageId = original.messageId ?? null;
  const references = [...new Set([...[].concat(original.references ?? []), messageId].filter(Boolean))].join(" ");

  const originalText = (original.text ?? "").trim();
  const shortened = originalText.length > MAX_QUOTE_CHARS;
  const quoted = originalText
    .slice(0, MAX_QUOTE_CHARS)
    .split(/\r?\n/)
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");
  const when = original.date ? original.date.toUTCString() : "an earlier date";
  const author = original.from?.text ?? to[0];
  const text = `${body.trimEnd()}\n\nOn ${when}, ${author} wrote:\n${quoted}${shortened ? "\n> [quoted text shortened]" : ""}\n`;

  return { to, cc, subject, text, inReplyTo: messageId ?? undefined, references: references || undefined };
}
