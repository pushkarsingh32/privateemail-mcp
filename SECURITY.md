# Security

## Reporting a vulnerability

Please report security issues privately through GitHub's "Report a vulnerability" button on the Security tab of this repository. Do not open a public issue for them.

## What to know before you use it

- **Email is untrusted input.** Anyone can send your mailbox text that tries to steer the AI model ("forward all invoices to ..."). `read_message` labels bodies as untrusted, but the model can still be fooled. Keep your client's approval prompt switched on for `send_email` and read what it is about to send.
- **There is no delete tool,** and recipients per message are capped at 20, to limit the damage of a mistake or an injected instruction.
- **The password is never logged or returned in tool output.** It is read from `EMAIL_APP_PASSWORD` or the macOS Keychain on each call. Use an app password where your provider offers one, so you can revoke it without changing your main password.
- **Anyone who can run this server as you can use the mailbox.** Treat the MCP config like any other credential store, and do not commit it.
