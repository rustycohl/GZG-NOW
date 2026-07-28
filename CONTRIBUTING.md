# Contributing

GZG:NOW is intentionally small and evidence-led.

Before proposing a change:

1. preserve the no-game-server boundary;
2. keep JOKE and NEURAL integrations truthful—absent adapters remain
   `not-implemented`;
3. keep all game state derivable from signed, canonical events;
4. keep the Base-10 AP pool under `ActionEconomy`;
5. keep Commander Card AP values as modifiers, never absolute pools;
6. add or update deterministic tests; and
7. do not erase historical evidence to make the current build look cleaner.

Run:

```text
npm run check
npm test
```

Version 0.1 software contributions are accepted under MIT or Apache-2.0, at
the recipient's option, unless explicitly agreed otherwise. Documentation
contributions under `docs/` are accepted under CC BY 4.0. The v0.2 software
line is intended to use Apache-2.0.
