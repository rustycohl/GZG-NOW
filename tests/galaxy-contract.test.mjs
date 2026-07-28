import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createGalaxyMessage,
  sealGalaxyMessage,
  validateGalaxyMessage,
  verifyGalaxyMessage,
} from "../site/lib/galaxy-envelope.mjs";

const fixtureUrl = (name) => new URL(`../contracts/examples/${name}`, import.meta.url);

test("published galaxy examples satisfy the executable envelope contract", async () => {
  for (const name of ["atlas-selection.json", "xcommand-extraction.json"]) {
    const fixture = JSON.parse(await readFile(fixtureUrl(name), "utf8"));
    assert.deepEqual(validateGalaxyMessage(fixture), fixture);
  }
});

test("message creation preserves extensions for forward-compatible forwarding", () => {
  const message = createGalaxyMessage({
    gzg: "attempted-override",
    version: "99.0",
    proof: {
      algorithm: "sha-256",
      digest: "0".repeat(64),
    },
    id: "atlas-001",
    type: "atlas.selection",
    source: {
      galaxy: "ATLAS",
      version: "0.1.0-alpha.1",
      instance: "test",
      extension: "preserved",
    },
    target: {
      galaxy: "*",
      capability: "tactical.deploy",
    },
    created_at: "2026-07-28T12:00:00.000Z",
    payload: {
      schema: "gzg.atlas.selection/1.0",
      deployable: true,
    },
    relay_hint: "manual-export",
  });

  assert.equal(message.relay_hint, "manual-export");
  assert.equal(message.source.extension, "preserved");
  assert.equal(message.gzg, "galaxy-message");
  assert.equal(message.version, "1.0");
  assert.equal(message.proof, undefined);
});

test("sealed messages verify and tampering is detected", async () => {
  const message = createGalaxyMessage({
    id: "mission-001",
    type: "dealer.deploy",
    source: {
      galaxy: "DEALER",
      version: "0.1.0-alpha.1",
      instance: "test",
    },
    target: {
      galaxy: "xCommand",
      capability: "tactical.deploy",
    },
    created_at: "2026-07-28T12:00:00.000Z",
    payload: {
      schema: "gzg.dealer.deployment/1.0",
      mission_seed: "fixed-seed",
    },
  });

  const sealed = await sealGalaxyMessage(message);
  assert.equal((await verifyGalaxyMessage(sealed)).ok, true);

  const tampered = structuredClone(sealed);
  tampered.payload.mission_seed = "changed";
  const report = await verifyGalaxyMessage(tampered);
  assert.equal(report.ok, false);
  assert.match(report.error, /does not match/);
});

test("receivers reject malformed and unknown-major messages", () => {
  const base = {
    gzg: "galaxy-message",
    version: "1.0",
    id: "example",
    type: "atlas.selection",
    source: {
      galaxy: "ATLAS",
      version: "0.1.0",
      instance: "test",
    },
    target: {
      galaxy: "*",
      capability: "tactical.deploy",
    },
    created_at: "2026-07-28T12:00:00.000Z",
    payload: {},
  };

  assert.throws(
    () => validateGalaxyMessage({ ...base, version: "2.0" }),
    /Unsupported/,
  );
  assert.throws(
    () => validateGalaxyMessage({ ...base, type: "Unsafe Type" }),
    /lowercase dotted/,
  );
  assert.throws(
    () => validateGalaxyMessage({ ...base, created_at: "today" }),
    /UTC ISO-8601/,
  );
});

test("the JSON schema states the same required wire fields and open extension policy", async () => {
  const schema = JSON.parse(
    await readFile(new URL("../contracts/galaxy-message.schema.json", import.meta.url), "utf8"),
  );

  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.properties.gzg.const, "galaxy-message");
  assert.deepEqual(
    schema.required,
    ["gzg", "version", "id", "type", "source", "target", "created_at", "payload"],
  );
  assert.equal(schema.additionalProperties, true);
});
