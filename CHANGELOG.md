# Changelog

## 0.2.0

- New `reply_to_message` tool. It replies the way a mail client does: sends to the sender (or everyone with `reply_all`), adds `Re:` to the subject, sets `In-Reply-To` and `References` so the reply stays in the thread, and appends the quoted original under your text. `dry_run` returns the composed reply without sending.
- `send_email` is now for new messages only. Its `in_reply_to` and `references` options moved into `reply_to_message`.
- Fixed: the `message_id` returned after sending did not match the header on the delivered message.
- README: Namecheap Private Email notes (ports, password types, sending limits).

## 0.1.2

- No code changes. First release published from GitHub Actions through npm trusted publishing, with provenance.

## 0.1.1

- README: install guides for Claude Code, Claude Desktop, Codex, Cursor, VS Code, Gemini CLI and Zed, plus one-click install buttons for Cursor and VS Code.
- Added `mcpName` and `server.json` so the server can be listed in the official MCP registry.
- The server now reports its version from `package.json`.

## 0.1.0

First release.

- Tools: `list_folders`, `search_messages`, `read_message`, `send_email`, `mark_read`, `move_messages`.
- Defaults to Namecheap Private Email (`mail.privateemail.com`, IMAP 993, SMTP 465). Host and port are configurable.
- Password from `EMAIL_APP_PASSWORD`, or from the macOS Keychain.
- No delete tool. Reading a message does not mark it read.
