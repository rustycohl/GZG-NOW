# Ground Zero orientation

Status date: 2026-07-28

This is the shared starting point for the next alpha iteration. It records the
current product truth, publication boundaries, recovered legacy value, and the
next build lanes without presenting unfinished work as complete.

## 1. Naming and publication boundary

The project uses two deliberately separate publication lanes:

- **Ground Zero Gaming** publishes documents: Creative Commons **creative
  writing that compiles**. The public `groundzerogaming` repository belongs to
  this lane and remains a document release, not a finished software product.
- **Ground Zero Games** ships runnable products. Product repositories carry
  source, tests, status, and their own Pages deployments.

Public access does not erase this distinction. A public development Page can
still be infrastructure rather than part of the initial audience pitch.

## 2. Initial audience-facing release

The first public release is intentionally three surfaces:

| Surface | Role | Live Page |
| --- | --- | --- |
| `BattleStarSol` | Themed launch page for a clean browser tab | <https://rustycohl.github.io/BattleStarSol/> |
| `X-Command` | Standalone deterministic tactical-generator product demo | <https://rustycohl.github.io/X-Command/> |
| `d10SRD` | Creative Commons rules reference and executable conformance proof | <https://rustycohl.github.io/d10SRD/> |

`BattleStarSol` is deliberately inert. It is a front door, not the BattleStar
game and not a strategic or tactical authority.

`X-Command` is a real product demo, but its current boundary is exact:
deterministic deployment generation, a guaranteed route, versioned payload,
Base-10 AP, behavior-only difficulty, replay, one bounded contact resolution,
and JSON export. It is not yet the full recovered Godot simulation.

`d10SRD` is both an audience-facing rules publication and an independent
protocol port. Earlier d10 SRD material released under CC0 remains CC0; the
current-alpha document is CC BY 4.0.

## 3. Live development network

GZG:NOW is the integration lab:

<https://rustycohl.github.io/GZG-NOW/>

The current alpha proves an honest browser-local evidence loop:

1. ORACLE Ghost and local claim;
2. DEALER card selection;
3. strict Base-10 xCommand action spend;
4. canonical scaled-d10 MARK resolution;
5. signed, hash-linked events;
6. literal local P2Pm proof-of-work; and
7. replay verification and derived ownership.

It does not claim JOKE chain settlement, wallet custody, NEURAL issuance,
hosting yield, public peer transport, or production security.

Each working server card is also an independent **port in a storm**:

- ORACLE — <https://rustycohl.github.io/ORACLE/>
- d10SRD — <https://rustycohl.github.io/d10SRD/>
- xCommand — <https://rustycohl.github.io/xCommand/>
- DEALER — <https://rustycohl.github.io/DEALER/>
- MARK — <https://rustycohl.github.io/MARK/>
- P2Pm — <https://rustycohl.github.io/P2Pm/>

These Pages remain live and open. Except for d10SRD’s dual role, they primarily
serve integration and backend testing. A port receives a repository only when
it has working code, tests, truthful status, and an independent Page; empty
canonical names do not receive hollow repositories.

## 4. Canonical implementation rules

The late 2026-07-28 resolved architecture controls over earlier drafts:

- no game servers;
- exact developer/public naming registers;
- strict Base-10 action authority;
- Commander cards modify costs and never replace the AP pool;
- d20 difficulty and check-facing modifiers scale to d10;
- natural 1 and 10 are threats confirmed on 6+;
- deterministic, versioned payloads and replay evidence;
- ORACLE “Leave Evidence” as a load-bearing phase;
- JOKE, NEURAL, and P2Pm chain behavior must be literal, never simulated by
  labels; and
- every module advancement requires working code, tests, and status.

The current v0.1 software lane uses MIT where a software-native Creative
Commons equivalent is needed. GZG:NOW also preserves the Apache-2.0 rights
granted by its first public commit. Current original documentation is CC BY
4.0. The maintained v0.2 software line is intended to use Apache-2.0.

## 5. Legacy, Gemini, and Grok review

The legacy BattleStar/xCommand Godot tree remains evidence, not cleanup:

- its recovered 4.7.1 headless test baseline was green at the prior checkpoint;
- its action economy, coordinate transforms, payload contracts, procedural
  world builder, movement, combat, AI, and presentation work remain valuable;
- its older matchmaking and server-authority experiments are superseded by
  the no-game-server decision; and
- the inspected Web wrapper referenced runtime `.wasm` and `.pck` files that
  were not present, so it is not represented as the current live product.

The Gemini modularization contributes useful separation notes and recovered
modules, but it is not a complete runnable replacement for the legacy Godot
tree. The Grok 4.5 review is preserved as analysis; proposals that restore
server authority are superseded. Neither review is discarded, and neither
overrides the resolved architecture.

## 6. Next alpha iteration

Two tracks now proceed without conflating them:

### Public product track

1. Keep `BattleStarSol` small and stable as the launch surface.
2. Extend `X-Command` from generator to one deterministic playable tactical
   turn: route selection, AP-priced movement, cover posture, one hostile
   response, event record, and extraction payload.
3. Keep the generated deployment contract byte-stable and versioned while the
   playable surface grows around it.
4. Finish narrow-viewport and keyboard/accessibility QA across the release
   trio.

### Substrate track

1. Stand up the modern PIVX-lineage JOKE development fork without claiming a
   live value network.
2. Replace local ORACLE development claims with an explicit wallet adapter.
3. Add the NEURAL protocol only when issuance and settlement are literal.
4. Connect P2Pm ownership and hosting yield only after the chain and identity
   adapters pass their own repository gates.

The tactical product can improve while the substrate is built, but neither
track may fake the other. Versioned adapters are the boundary.
