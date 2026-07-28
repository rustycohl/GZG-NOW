# Review findings carried into the alpha

Date: 2026-07-28

## Public modular document release

The public `rustycohl/groundzerogaming` repository is already a meaningful
deliverable: an extensive Creative Commons design notebook with an explicit
invitation to improve the design. It is preserved as published.

It is not an executable modular codebase. Several embedded examples reflect
earlier decisions: exploding d10 behavior, non-Base-10 AP, alternate ATLAS and
HAILI expansions, server authority, placeholder signatures, timestamp-derived
anchors, and modules outside the locked scope. GZG:NOW does not silently
inherit those examples.

## Gemini modularization

The Gemini material contains useful decomposition ideas, manifests, code
fragments, and a partially patched Godot tree. Much of the supposed module tree
is stored as document files rather than runnable source, and the extracted tree
does not form a complete Godot project. The intact tactical project remains the
stronger pre-alpha baseline.

Useful changes observed in that line include broader AI action candidates,
height-aware pathfinding, tutorial and universal-skill work, field-of-view
logic, and a missing-return repair. Those belong to the BattleStar tactical
track and are not copied into this browser protocol alpha.

## Grok 4.5 reports

The three reports were reviewed visually. They contain useful tactical and
networking critique, but their proposed host/server authority conflicts with
the later controlling decision that there is no game server. Their refactoring
advice remains evidence; their authority model does not control GZG:NOW.

## Prior Codex build

The previous Codex baseline is intact. Its static boundary checks and Godot
headless tests pass. It includes a polished tactical prototype, open rules
packages, service experiments, and a Pages candidate. Its matchmaking and
server-authority pieces are historical experiments under the newer canon.

## Traceability gap

One working-state note references `GZG-ARCHITECTURE-RESOLVED.md`, but that exact
file was not present in the local canonical batch or connected Drive search.
The July 28 resolutions and the full current canonical batch contain enough
controlling decisions to build this slice. The missing filename remains logged
for future provenance, not treated as a blocker.
