# Server-card port contract

Status: controlling repository and deployment contract for GZG:NOW

Server cards are protocol-port galaxies. The broader rules for every product,
reference, tool, and port Page are defined in
[`GALAXY-CONTRACT.md`](GALAXY-CONTRACT.md); this document adds the manifest and
release requirements specific to server cards.

## Constraint turned architecture

GitHub Pages provides one live Pages site per repository. Ground Zero Games
uses that constraint directly:

> one server card = one independent repository = one live Page

A server card is a static catalyst and protocol port. It is not a game daemon
and does not reintroduce server authority.

## Required flag

Every server-card manifest carries:

```json
{
  "flag": "DEDICATED_REPO_PAGE",
  "repository": {
    "required": true,
    "independent": true,
    "full_name": "rustycohl/ORACLE"
  },
  "page": {
    "required": true,
    "url": "https://rustycohl.github.io/ORACLE/"
  }
}
```

The flag is structural. A card without its own repository and Page is an
embedded module or design candidate, not a released server card.

## Port-in-a-storm rules

1. The card repository owns its source, history, tests, release state, and Page.
2. A product repository consumes a card contract; it does not absorb the card.
3. Every Page must load and explain its status without another GZG repository.
4. Runtime assets required by the Page ship in the same repository.
5. Shared schemas are copied or version-pinned. There is no mutable shared
   runtime whose outage breaks every port.
6. Each card exposes a machine-readable `card.json`.
7. Each card exposes a browser self-test and an automated test.
8. Status is explicit: `scaffold`, `alpha`, `beta`, `stable`, `dormant`, or
   `historical`. A Page is not proof of implementation by itself.
9. Signed data and deterministic behavior cross card boundaries; hidden
   server state does not.
10. Products may skin or compose a card, but the generic reference port remains
    independently usable.
11. Cross-repository behavior uses the versioned galaxy-message envelope; a
    card never requires another repository's mutable runtime code.

## First extracted ports

The existing GZG:NOW vertical slice provides working code for:

- `ORACLE`
- `d10SRD`
- `xCommand`
- `DEALER`
- `MARK`
- `P2Pm`

They are extracted first because each already has executable behavior and a
test. Remaining canonical ports are created only as their core+module gate is
met; empty repositories are not counted as delivery.
