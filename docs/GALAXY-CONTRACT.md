# Galaxy autonomy and interoperability contract

Status: controlling engineering contract for every Ground Zero Games Page

## One Page, one galaxy

A GitHub Pages surface is an independent galaxy:

> one galaxy = one repository = one Page = one independently usable product or
> protocol port

“Server card” remains the name for a protocol-port galaxy such as ORACLE,
DEALER, or MARK. Products, references, launch surfaces, and tools are galaxies
too. The autonomy rule applies to all of them.

Each galaxy owns:

- its source and history;
- the complete runtime assets required by its Page;
- automated tests and a browser self-test;
- current status, license, changelog, and known limitations;
- a documented local or demo path that works when every other galaxy is
  unavailable; and
- import/export examples for every public message type it accepts or emits.

A galaxy may become more useful when peers are present, but it must still load,
explain itself, and provide its core bounded behavior alone. No Page may import
mutable runtime code from another Ground Zero repository.

## Standard I/O

Galaxies exchange data through `gzg.galaxy-message/1.0`, defined by
[`contracts/galaxy-message.schema.json`](../contracts/galaxy-message.schema.json).
The outer envelope is stable while each message type owns a versioned inner
payload.

Required envelope fields:

| Field | Meaning |
| --- | --- |
| `gzg` | Literal `galaxy-message` discriminator |
| `version` | Envelope version; receivers reject unsupported major versions |
| `id` | Sender-generated stable message identifier |
| `type` | Capability event such as `atlas.selection` or `xcommand.extraction` |
| `source` | Emitting galaxy, product version, and local instance |
| `target` | Destination galaxy or `*`, plus the required capability |
| `created_at` | UTC ISO-8601 creation time |
| `payload` | Message-specific, versioned data |

`correlation_id` connects a response or extraction to the deployment that
caused it. `proof`, when present, is a SHA-256 digest of the canonical envelope
without the `proof` member. Extensions are allowed and must survive forwarding.

Receivers:

1. validate the envelope before reading the inner payload;
2. reject an unknown major envelope version;
3. validate the inner payload against the schema named by that payload;
4. preserve fields they do not interpret;
5. reject non-finite numbers and ambiguous values before hashing;
6. treat URL, browser storage, and `postMessage` input as untrusted; and
7. never silently replace missing peer authority with simulated authority.

The reference implementation lives at
[`site/lib/galaxy-envelope.mjs`](../site/lib/galaxy-envelope.mjs). Canonical
examples live in [`contracts/examples`](../contracts/examples).

## Transport adapters

The envelope is transport-neutral. A static galaxy may use:

- file download/upload for durable manual transfer;
- URL query or hash state for a bookmarkable launch;
- `window.postMessage` for a composed same-browser experience; or
- browser storage as a local cache and vault.

Transport does not change authority. `postMessage` receivers must validate the
origin when a fixed peer is expected and must always validate the message.
Local storage is recoverable convenience, not network truth. URL state must be
bounded and must not contain private keys or credentials.

When a galaxy is embedded, the composed product is an adapter. The embedded
galaxy keeps its standalone entry point and message contract.

## Tight modular delivery loop

Every bounded module is completed through the same loop:

1. **Back up** — record the starting commit and preserve irreplaceable inputs.
2. **Document** — state purpose, inputs, outputs, invariants, fallback, status,
   and explicit non-goals before claiming the module is complete.
3. **Implement** — change the smallest independently testable module.
4. **Review** — inspect the diff, source provenance, licensing, failure paths,
   accessibility, and security boundary.
5. **Correct** — fix discovered defects and rerun the relevant checks.
6. **Document again** — record actual behavior, validation evidence, remaining
   limitations, and any contract change.
7. **Push or publish** — push/deploy runnable Ground Zero **Games** products;
   publish Ground Zero **Gaming** documents under their declared Creative
   Commons terms.
8. **Live smoke** — exercise the public Page, not only the local checkout.
9. **Record** — leave the repository and shared map truthful for the next loop.

A green workflow proves only what it tests. A pretty Page proves only that a
Page rendered. Neither substitutes for the galaxy’s claimed core behavior.

## Versioning and compatibility

- Additive envelope changes remain within major version `1`.
- Removing, renaming, or changing the meaning of a required field requires a
  new major version.
- Inner payloads carry their own schema/version and evolve independently.
- Senders may target `*` only when the capability, not a branded product, is
  authoritative.
- Receivers should export a useful error object or human-readable rejection;
  they must not reinterpret malformed data.
- Repositories pin or copy the contract version they implement so an outage or
  later incompatible edit cannot disable a Page.

This is a no-game-server architecture. Deterministic data, evidence, and
explicit adapters cross galaxy boundaries; hidden shared server state does not.
