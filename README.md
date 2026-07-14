# keyspace — password strength checker

A single-page password strength checker. Everything runs client-side — nothing you type is sent anywhere.

## Run it
Just open `index.html` in a browser. No build step, no dependencies.

## What it checks
- Length, character variety (lowercase / uppercase / digits / symbols)
- Estimated entropy (bits) based on character set size and length
- Whether the password (or its base with trailing digits stripped) is in a common-password list
- Repeated character runs (e.g. `aaaa`) and obvious keyboard/alphabet sequences (e.g. `abcd`, `1234`, `qwerty`)
- A rough "time to crack" estimate assuming a fast offline attack (10 billion guesses/sec)

## Files
- `index.html` — structure
- `style.css` — terminal-inspired dark theme
- `script.js` — all scoring logic
