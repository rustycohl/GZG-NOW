# GZG:NOW

GZG:NOW is a browser-local protocol reference alpha for Ground Zero Games.
It proves one narrow, honest vertical slice:

1. enter as an ORACLE Ghost using a local cryptographic session;
2. claim that session locally;
3. choose a DEALER card whose AP field is a modifier, never an absolute pool;
4. resolve a MARK action with the canonical scaled d10 rules;
5. record the result in a signed, hash-linked event ledger;
6. mint a P2Pm artifact with browser-computed proof-of-work; and
7. replay and verify the exported evidence without a game server.

This release does **not** contain a JOKE or PIVX fork, issue NEURAL, contact a
masternode, provide a wallet, or claim chain settlement. Those adapters are
explicitly marked `not-implemented` in the data model and interface.

## Run it

The product has no runtime dependencies and no build step.

```text
npm test
npm start
```

Then open `http://127.0.0.1:4173`. GitHub Pages publishes the same files from
`site/`.

## Repository boundaries

- `site/` — the complete browser product.
- `tests/` — deterministic protocol and rules tests.
- `docs/` — current engineering contract, review findings, and publication map.
- `products/` — a map to independent audience-facing product repositories.
- `ports/` — a map to independent protocol/test repositories.
- `tools/` — a tiny local static server for testing.

The separate `rustycohl/groundzerogaming` repository is the already-published
Creative Commons document line: **creative writing that compiles**. “Gaming”
names the documentary/rules publication, while “Games” names runnable products.
That repository is preserved as its own deliverable and is not represented here
as executable software.

## Public release hierarchy

The first audience-facing release is:

1. `BattleStarSol` — the themed launch page for a clean browser tab;
2. `X-Command` — the standalone tactical-generator product demo; and
3. `d10SRD` — the Creative Commons rules reference.

GZG:NOW and the remaining independent Pages stay live and public, primarily as
the integration lab and backend test network.

## Status

Version: `0.1.0-alpha.3`

This is pre-alpha-to-alpha bridge work. It is suitable for protocol inspection,
local play, replay verification, and static web testing. It is not suitable for
holding value, identity custody, or production networking.

## Licensing

Version 0.1 software is available under MIT or Apache License 2.0, at your
option. Documentation in `docs/` is licensed under Creative Commons
Attribution 4.0 International. See `LICENSE`, `LICENSE-MIT`,
`LICENSE-APACHE`, `DOCUMENTATION-LICENSE.md`, and `NOTICE`.

The v0.2 software line is intended to use Apache-2.0.
