# Validation record

Date: 2026-07-28

## Galaxy contract module

- Shared envelope schema and two canonical examples: pass.
- Executable validation rejects malformed messages and unknown major versions:
  pass.
- Unknown extension fields survive validation and forwarding: pass.
- Required discriminator and version cannot be overridden by callers: pass.
- Canonical SHA-256 sealing verifies and detects payload tampering: pass.
- Full GZG:NOW suite after the module: 22/22 pass.
- Node.js syntax checks: pass.

## Automated checks

- Node.js 22 syntax check: pass.
- Product protocol, rules, and registry suite: 17/17 pass.
- Canonical serialization and deterministic generation: pass.
- Published d10 ability table, including `4–5 → -2`: pass.
- Scaled DC tiers and 6+ threat confirmation: pass.
- Strict Base-10 AP and absolute-AP card rejection: pass.
- Ed25519 event signatures and hash-link verification: pass.
- Tamper detection: pass.
- Ghost mint rejection: pass.
- Claimed-session artifact proof and derived ownership: pass.
- MARK replay determinism: pass.
- Dedicated repo/Page flag, uniqueness, and complete alpha port set: pass.
- Two-products-plus-one-SRD publication hierarchy: pass.

## Live browser walkthrough

Surface: isolated in-app Chromium browser at `http://127.0.0.1:4173`

1. App initialized as an ORACLE Ghost with one signed genesis event.
2. Local development session claim succeeded.
3. BREAKER Commander Card selected.
4. MARK round resolved against DC 8:
   `4 + 2 ability + 1 skill + 1 situational = 8`.
5. xCommand charged 3 AP and preserved the strict 10 AP maximum.
6. P2Pm found a three-zero SHA-256 proof after 1,623 local attempts.
7. Final verification passed:
   four signed events, valid proof, owner derived from the ledger, and no chain
   settlement claimed.
8. Browser console errors: none.

The proof count is evidence from this walkthrough, not a fixed expected value;
each new random session seed produces different literal work.

## Independent server-card ports

Repositories and Pages:

- `rustycohl/ORACLE` — <https://rustycohl.github.io/ORACLE/>
- `rustycohl/d10SRD` — <https://rustycohl.github.io/d10SRD/>
- `rustycohl/xCommand` — <https://rustycohl.github.io/xCommand/>
- `rustycohl/DEALER` — <https://rustycohl.github.io/DEALER/>
- `rustycohl/MARK` — <https://rustycohl.github.io/MARK/>
- `rustycohl/P2Pm` — <https://rustycohl.github.io/P2Pm/>

Each independent repository passed its Node.js port test. Each Pages deployment
completed successfully. A public-browser sweep then produced `PORT PASS` on all
six live Pages, with no console entries.

## Initial public release

- `BattleStarSol`: 2/2 repository checks pass. The public Page exposed exactly
  two audience launch cards plus the development-lab route, with no console
  entries.
- `X-Command`: 8/8 deterministic-generator checks pass. The public Page
  generated 192 cells, passed replay, resolved a 4 AP contact from the strict
  10 AP pool, and produced no console entries.
- `d10SRD`: 3/3 publication and conformance checks pass. The public Page passed
  its port self-test, resolved the published confirmed-critical example, and
  produced no console entries.

All three repository workflows and GitHub Pages deployments completed
successfully.

The alpha.3 GZG:NOW hub was tested locally after integration. It exposed the
three public-release entries separately from all six backend port flags,
completed the full four-event evidence loop, verified the artifact proof and
derived owner, and produced no console entries.

The production alpha.3 workflow then completed successfully. A public-browser
smoke test confirmed version `0.1.0-alpha.3`, all three front-door entries, the
separate backend-port section, local protocol readiness, and no console
entries.

## Still pending at this checkpoint

- Dedicated narrow-viewport browser capture.
- External security review.
- JOKE wallet/chain adapter and peer transport, which are out of scope for this
  alpha version.
