# privateemail-mcp: Namecheap Private Email MCP server

A Model Context Protocol (MCP) server that gives Claude, Cursor and other AI assistants access to a [Namecheap Private Email](https://www.namecheap.com/hosting/email/) mailbox over IMAP and SMTP. Search your inbox, read messages, reply and send, from Claude Code, Claude Desktop, Cursor or any other MCP client.

It talks plain IMAP and SMTP, so it also works as a general email MCP server for other mailboxes if you change the host settings (see [Configuration](#configuration)). Namecheap Private Email is the default and the one it was built and tested against.

> Not affiliated with or endorsed by Namecheap. "Private Email" is their product name, used here to say what the server connects to.

## Tools

| Tool | What it does |
| --- | --- |
| `list_folders` | Folders with total and unread counts |
| `search_messages` | Newest matches by sender, recipient, subject, body text, date range or unread state |
| `read_message` | Headers, plain-text body and attachment names. Does not mark the message read |
| `send_email` | Send mail (plain text, optional HTML, threaded replies) and save a copy in Sent |
| `mark_read` | Mark messages read or unread |
| `move_messages` | Move messages to another folder, for example Archive |

There is deliberately **no delete tool**, and a message can have at most 20 recipients.

## Setup

You need Node.js 20 or newer, and the mailbox address plus its password (or an app password, if you use one).

### Claude Code

```sh
claude mcp add privateemail \
  -e EMAIL_ADDRESS=you@yourdomain.com \
  -e EMAIL_APP_PASSWORD=your-password \
  -- npx -y privateemail-mcp
```

### Claude Desktop, Cursor and other clients

Add this to the client's MCP config:

```json
{
  "mcpServers": {
    "privateemail": {
      "command": "npx",
      "args": ["-y", "privateemail-mcp"],
      "env": {
        "EMAIL_ADDRESS": "you@yourdomain.com",
        "EMAIL_APP_PASSWORD": "your-password"
      }
    }
  }
}
```

### Keeping the password out of the config (macOS)

Store it in the Keychain and leave `EMAIL_APP_PASSWORD` out of the config. The command prompts for the password:

```sh
security add-generic-password -a you@yourdomain.com -s privateemail-mcp -w
```

The server reads it from the Keychain on every call, so changing the password needs no restart.

## Configuration

All settings are environment variables.

| Variable | Default | Notes |
| --- | --- | --- |
| `EMAIL_ADDRESS` | none, required | Full mailbox address, also used as the login |
| `EMAIL_APP_PASSWORD` | none | If unset on macOS, the Keychain is used |
| `EMAIL_KEYCHAIN_SERVICE` | `privateemail-mcp` | Keychain item name |
| `IMAP_HOST` / `IMAP_PORT` | `mail.privateemail.com` / `993` | Port 993 uses TLS. Any other port requires STARTTLS |
| `SMTP_HOST` / `SMTP_PORT` | `mail.privateemail.com` / `465` | Port 465 uses TLS. Any other port requires STARTTLS |

## Security

Email is untrusted input: a message can contain text written to trick the AI into acting on it. Keep your client's approval prompt on for `send_email`. Details and how to report a problem are in [SECURITY.md](SECURITY.md).

## Troubleshooting

- **"Timed out talking to the mail server".** Check the host, port and network. A wrong password against Namecheap showed up as a timeout in testing, so check that too.
- **"No password found".** Set `EMAIL_APP_PASSWORD`, or add the Keychain item above. The Keychain fallback only exists on macOS.
- **Messages missing from search.** `search_messages` looks in `INBOX` unless you pass a `folder`. Use `list_folders` to see the exact names.

## Development

```sh
npm install
npm test
```

The tests start the real server over stdio with no credentials, so they never touch the network.

## License

MIT
