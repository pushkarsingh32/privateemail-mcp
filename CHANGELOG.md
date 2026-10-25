# Changelog

## 0.1.0

First release.

- Tools: `list_folders`, `search_messages`, `read_message`, `send_email`, `mark_read`, `move_messages`.
- Defaults to Namecheap Private Email (`mail.privateemail.com`, IMAP 993, SMTP 465). Host and port are configurable.
- Password from `EMAIL_APP_PASSWORD`, or from the macOS Keychain.
- No delete tool. Reading a message does not mark it read.
