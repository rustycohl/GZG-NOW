# Independent server-card ports

Each child directory is its own Ground Zero Games Git repository and GitHub
Pages product. The
directories are intentionally ignored by the parent `GZG-NOW` repository
except for this map.

The contract is documented in `../docs/SERVER-CARD-CONTRACT.md`.

First extracted ports:

- [`ORACLE`](https://rustycohl.github.io/ORACLE/)
- [`d10SRD`](https://rustycohl.github.io/d10SRD/)
- [`xCommand`](https://rustycohl.github.io/xCommand/)
- [`DEALER`](https://rustycohl.github.io/DEALER/)
- [`MARK`](https://rustycohl.github.io/MARK/)
- [`P2Pm`](https://rustycohl.github.io/P2Pm/)

They share a generated visual shell but no live shared runtime. Every port
ships the source modules it needs, its own automated test, a browser self-test,
a machine-readable `card.json`, and an independent Pages workflow.
