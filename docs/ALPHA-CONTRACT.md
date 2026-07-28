# GZG:NOW alpha contract

Status: controlling engineering interpretation for `0.1.0-alpha.1`

## What this alpha must prove

GZG:NOW must run as a static browser product with no game server. A user can
enter locally, take a rules-governed action, produce signed evidence, perform
literal computation for an artifact proof, export the evidence, and verify it.

The vertical slice is:

`ORACLE → DEALER → xCommand / d10SRD → MARK → P2Pm → signed replay`

## Controlling decisions

- The network shape is peer-first and wallet/client-led. No game server is
  introduced by this alpha.
- `ActionEconomy` owns a strict pool of 10 AP. A card may contain an AP
  modifier, but may not contain or replace the absolute pool.
- In this alpha, a card modifier changes the quoted cost of its action and is
  bounded from -3 to +3. It never changes the 10 AP maximum. This is a
  reversible implementation interpretation pending a more specific card rule.
- The core check is `d10 + ability modifier + skill ranks + situational`
  against a scaled DC.
- The published ability table is controlling. The implementation calculates
  the legacy d20 modifier first, halves it, and rounds halves away from zero;
  this preserves the table's `4–5 → -2` boundary. Human scores remain 4–20.
- DC tiers are 3, 5, 8, 10, and 13+.
- A natural 10 or natural 1 is a threat. A second d10 confirms on 6+.
- Ghost sessions may play and sign local events, but may not mint artifacts.
- A claimed local development session may mint. This is not a wallet identity
  and conveys no chain ownership or monetary value.
- Artifact ownership state is derived from the signed event sequence.
- P2Pm means literal work in this slice: the browser performs SHA-256
  proof-of-work. Hosting yield, peer transport, mint economics, and token
  settlement remain future modules.
- JOKE will require a real modern PIVX re-fork. This repository does not fake
  one.
- NEURAL is a real future token on JOKE infrastructure, not a points counter in
  this alpha.

## Determinism boundary

The initial session seed is random and exported. From that seed onward, MARK
challenge selection, rolls, confirmations, event ordering, and artifact
verification are deterministic.

Wall-clock time is transport metadata only. It is excluded from event IDs,
signatures, game state, and proof-of-work.

## Security boundary

The browser creates an extractable local Ed25519 session only for protocol
demonstration. The private key stays in memory and is not exported by the app.
Refreshing the page destroys it. Production identity must be delegated to a
real JOKE-compatible wallet adapter and reviewed separately.
