# Validation record

Date: 2026-07-28

## Automated checks

- Node.js 22 syntax check: pass.
- Protocol and rules suite: 13/13 pass.
- Canonical serialization and deterministic generation: pass.
- Published d10 ability table, including `4–5 → -2`: pass.
- Scaled DC tiers and 6+ threat confirmation: pass.
- Strict Base-10 AP and absolute-AP card rejection: pass.
- Ed25519 event signatures and hash-link verification: pass.
- Tamper detection: pass.
- Ghost mint rejection: pass.
- Claimed-session artifact proof and derived ownership: pass.
- MARK replay determinism: pass.

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

## Still pending at this checkpoint

- GitHub Actions execution on the eventual repository.
- Production GitHub Pages deployment and URL smoke test.
- Dedicated narrow-viewport browser capture.
- External security review.
- JOKE wallet/chain adapter and peer transport, which are out of scope for this
  alpha version.
