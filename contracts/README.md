# GZG galaxy contracts

This directory contains transport-neutral contracts copied or version-pinned
by independent Ground Zero Games galaxies.

- `galaxy-message.schema.json` defines the shared `1.0` outer envelope.
- `examples/atlas-selection.json` is a strategic coordinate selection.
- `examples/xcommand-extraction.json` is a tactical mission result returned to
  a strategic surface.

The executable reference validator, canonicalizer, and proof helpers are in
`site/lib/galaxy-envelope.mjs`. A consuming repository must keep its own tested
copy or pin an immutable release. It must not depend on this repository being
online at runtime.

Payload schemas are owned by the emitting capability. The envelope validates
routing and provenance; it does not make an unvalidated inner payload safe.
