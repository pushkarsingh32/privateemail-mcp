# privateemail-mcp: Namecheap Private Email MCP server

<p>
  <a href="https://www.npmjs.com/package/privateemail-mcp"><img alt="npm" src="https://img.shields.io/npm/v/privateemail-mcp"/></a>
  <a href="https://github.com/pushkarsingh32/privateemail-mcp/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/pushkarsingh32/privateemail-mcp/actions/workflows/ci.yml/badge.svg"/></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-4CAF50"/></a>
</p>

A Model Context Protocol (MCP) server that gives Claude, Codex, Cursor and other AI assistants access to a [Namecheap Private Email](https://www.namecheap.com/hosting/email/) mailbox over IMAP and SMTP. Search your inbox, read messages, reply and send, from any MCP client.

It talks plain IMAP and SMTP, so it also works as a general email MCP server for other mailboxes if you change the host settings (see [Configuration](#configuration)). Namecheap Private Email is the default and the one it was built and tested against.

> Not affiliated with or endorsed by Namecheap. "Private Email" is their product name, used here to say what the server connects to.

<p>
  <a href="https://cursor.com/en/install-mcp?name=privateemail&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsInByaXZhdGVlbWFpbC1tY3AiXSwiZW52Ijp7IkVNQUlMX0FERFJFU1MiOiJ5b3VAeW91cmRvbWFpbi5jb20iLCJFTUFJTF9BUFBfUEFTU1dPUkQiOiJ5b3VyLWFwcC1wYXNzd29yZCJ9fQ=="><img alt="Install in Cursor" src="https://img.shields.io/badge/Cursor-Install_MCP-000000?style=for-the-badge&logo=cursor&logoColor=white"/></a>
  <a href="https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22privateemail%22%2C%22type%22%3A%22stdio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22privateemail-mcp%22%5D%2C%22env%22%3A%7B%22EMAIL_ADDRESS%22%3A%22you%40yourdomain.com%22%2C%22EMAIL_APP_PASSWORD%22%3A%22your-app-password%22%7D%7D"><img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-Install_MCP-0098FF?style=for-the-badge&logo=visualstudiocode&logoColor=white"/></a>
</p>

The buttons install the server with placeholder values (`you@yourdomain.com`, `your-app-password`). Replace them with your own in the client's MCP settings afterwards.

## Tools

| Tool | What it does |
| --- | --- |
| `list_folders` | Folders with total and unread counts |
| `search_messages` | Newest matches by sender, recipient, subject, body text, date range or unread state |
| `read_message` | Headers, plain-text body and attachment names. Does not mark the message read |
| `reply_to_message` | Reply the way a mail client does: right recipients, `Re:` subject, thread headers and the quoted original. Supports reply-all and a dry run that shows the final text without sending |
| `send_email` | Send a new message (plain text, optional HTML) and save a copy in Sent |
| `mark_read` | Mark messages read or unread |
| `move_messages` | Move messages to another folder, for example Archive |

There is deliberately **no delete tool**, and a message can have at most 20 recipients.

## Quick install

You need Node.js 20 or newer, and the mailbox address plus its password (or an app password, if you use one). Every block below runs the published package with `npx -y privateemail-mcp`. Swap in your own address and password.

<details>
<summary><b>Claude Code</b></summary>

```sh
claude mcp add privateemail \
  -e EMAIL_ADDRESS=you@yourdomain.com \
  -e EMAIL_APP_PASSWORD=your-app-password \
  -- npx -y privateemail-mcp
```

Add `-s user` to make it available in every project, or `-s local` (the default) for the current project only.

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Edit `claude_desktop_config.json` (Settings, Developer, Edit Config):

```json
{
  "mcpServers": {
    "privateemail": {
      "command": "npx",
      "args": ["-y", "privateemail-mcp"],
      "env": {
        "EMAIL_ADDRESS": "you@yourdomain.com",
        "EMAIL_APP_PASSWORD": "your-app-password"
      }
    }
  }
}
```

Restart Claude Desktop afterwards.

</details>

<details>
<summary><b>OpenAI Codex (CLI and IDE extension)</b></summary>

```sh
codex mcp add privateemail \
  --env EMAIL_ADDRESS=you@yourdomain.com \
  --env EMAIL_APP_PASSWORD=your-app-password \
  -- npx -y privateemail-mcp
```

Or add this to `~/.codex/config.toml`:

```toml
[mcp_servers.privateemail]
command = "npx"
args = ["-y", "privateemail-mcp"]
env = { EMAIL_ADDRESS = "you@yourdomain.com", EMAIL_APP_PASSWORD = "your-app-password" }
```

</details>

<details>
<summary><b>Cursor</b></summary>

Use the install button above, or edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (one project):

```json
{
  "mcpServers": {
    "privateemail": {
      "command": "npx",
      "args": ["-y", "privateemail-mcp"],
      "env": {
        "EMAIL_ADDRESS": "you@yourdomain.com",
        "EMAIL_APP_PASSWORD": "your-app-password"
      }
    }
  }
}
```

</details>

<details>
<summary><b>VS Code (GitHub Copilot)</b></summary>

Use the install button above, or add this to `.vscode/mcp.json`. VS Code asks for the password when the server starts and keeps it out of the file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "email-password",
      "description": "Mailbox password or app password",
      "password": true
    }
  ],
  "servers": {
    "privateemail": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "privateemail-mcp"],
      "env": {
        "EMAIL_ADDRESS": "you@yourdomain.com",
        "EMAIL_APP_PASSWORD": "${input:email-password}"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

```sh
gemini mcp add -s user \
  -e EMAIL_ADDRESS=you@yourdomain.com \
  -e EMAIL_APP_PASSWORD=your-app-password \
  privateemail npx -y privateemail-mcp
```

Or edit `~/.gemini/settings.json`. Gemini CLI expands `$VAR`, so the password can come from your shell environment instead of the file:

```json
{
  "mcpServers": {
    "privateemail": {
      "command": "npx",
      "args": ["-y", "privateemail-mcp"],
      "env": {
        "EMAIL_ADDRESS": "you@yourdomain.com",
        "EMAIL_APP_PASSWORD": "$PRIVATEEMAIL_PASSWORD"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Zed</b></summary>

Add this to your Zed settings file (`zed: open settings file`):

```json
{
  "context_servers": {
    "privateemail": {
      "command": "npx",
      "args": ["-y", "privateemail-mcp"],
      "env": {
        "EMAIL_ADDRESS": "you@yourdomain.com",
        "EMAIL_APP_PASSWORD": "your-app-password"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf, Cline, Roo Code, Kilo Code, JetBrains and other clients</b></summary>

Most other clients read the same `mcpServers` shape as Claude Desktop. Paste the block from the Claude Desktop section into the client's MCP config file (for Windsurf, `~/.codeium/windsurf/mcp_config.json`). If your client has a different format, the three things it needs are: command `npx`, arguments `-y privateemail-mcp`, and the two environment variables.

</details>

### Keeping the password out of the config (macOS)

Store it in the Keychain and leave `EMAIL_APP_PASSWORD` out of every config above. The command prompts for the password:

```sh
security add-generic-password -a you@yourdomain.com -s privateemail-mcp -w
```

The server reads it from the Keychain on every call, so changing the password needs no restart.

## Example prompts

```txt
Show me unread mail from the last 3 days and tell me which ones need a reply.
```

```txt
Find the email where a customer asked for a refund, and draft a reply for me to approve.
```

The assistant chains `search_messages`, `read_message` and `reply_to_message` on its own. Sending should always go through your client's approval prompt. The prompt shows the message id and your text but not the recipient, so ask for a dry run first: it returns the recipients and the full text before anything goes out.

## Configuration

All settings are environment variables.

| Variable | Default | Notes |
| --- | --- | --- |
| `EMAIL_ADDRESS` | none, required | Full mailbox address, also used as the login |
| `EMAIL_APP_PASSWORD` | none | If unset on macOS, the Keychain is used |
| `EMAIL_KEYCHAIN_SERVICE` | `privateemail-mcp` | Keychain item name |
| `IMAP_HOST` / `IMAP_PORT` | `mail.privateemail.com` / `993` | Port 993 uses TLS. Any other port requires STARTTLS |
| `SMTP_HOST` / `SMTP_PORT` | `mail.privateemail.com` / `465` | Port 465 uses TLS. Any other port requires STARTTLS |

## Namecheap Private Email notes

From Namecheap's [mail client settings](https://www.namecheap.com/support/knowledgebase/article.aspx/1179/2175/private-email-imap-pop3-smtp-settings/) and [sending limits](https://www.namecheap.com/support/knowledgebase/article.aspx/10719/2179/email-sending-and-usage-limits-for-private-email/) articles:

- The server is `mail.privateemail.com`. Only encrypted connections are accepted: IMAP on 993 (TLS) or 143 (STARTTLS), SMTP on 465 (TLS) or 587 (STARTTLS).
- The login is the full address, with the mailbox's master password or an application password.
- Outgoing authentication must be on and SPA (secure password authentication) off. This server already does the former and never uses SPA.
- Namecheap documents about 500 emails an hour per mailbox on paid plans and 20 an hour on trial plans, and at most 50 recipients per message. This server caps a message at 20 recipients.

## Security

Email is untrusted input: a message can contain text written to trick the AI into acting on it. Keep your client's approval prompt on for `send_email` and `reply_to_message`. Details and how to report a problem are in [SECURITY.md](SECURITY.md).

## Troubleshooting

- **"Timed out talking to the mail server".** Check the host, port and network. A wrong password against Namecheap showed up as a timeout in testing, so check that too.
- **"No password found".** Set `EMAIL_APP_PASSWORD`, or add the Keychain item above. The Keychain fallback only exists on macOS.
- **Messages missing from search.** `search_messages` looks in `INBOX` unless you pass a `folder`. Use `list_folders` to see the exact names.
- **The tools don't show up.** Restart the client after editing its config. Most clients only read MCP config at startup.

## Development

```sh
npm install
npm test
```

The tests start the real server over stdio with no credentials, so they never touch the network. They also check that `server.json` (used by the MCP registry) matches `package.json`.

## License

MIT
