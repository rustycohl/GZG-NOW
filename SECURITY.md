# Security policy

GZG:NOW `0.1.x` is a protocol reference alpha, not a wallet or value-bearing
system.

Do not use this build to hold funds, production credentials, private user data,
or authoritative ownership records. Its local Ed25519 key is ephemeral,
extractable by the browser runtime, and intentionally destroyed on refresh.
The app makes no network request except to load its own static files.

Security reports should avoid including live secrets or personal data. Until a
dedicated reporting channel is published, open a GitHub issue containing only a
minimal non-sensitive reproduction and request a private follow-up channel.

The following are known boundaries, not vulnerabilities in this alpha:

- no JOKE wallet adapter;
- no PIVX-derived chain;
- no NEURAL token;
- no peer transport;
- no secure persistent key store;
- no production audit.
