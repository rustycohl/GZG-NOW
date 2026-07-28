import assert from "node:assert/strict";
import test from "node:test";

import {
  deterministicD10,
  deterministicIndex,
  digestObject,
  stableStringify,
} from "../site/lib/core.mjs";

test("canonical serialization sorts object keys at every depth", () => {
  const left = {
    z: 4,
    a: {
      two: [3, { y: false, x: true }],
      one: "first",
    },
  };
  const right = {
    a: {
      one: "first",
      two: [3, { x: true, y: false }],
    },
    z: 4,
  };

  assert.equal(stableStringify(left), stableStringify(right));
});
test("canonical serialization rejects ambiguous values", () => {
  assert.throws(() => stableStringify({ value: undefined }), /Undefined/);
  assert.throws(() => stableStringify({ value: Number.NaN }), /Non-finite/);
  assert.throws(() => stableStringify(new Date()), /plain objects/);
});

test("object digests and deterministic rolls are reproducible", async () => {
  const firstDigest = await digestObject({ b: 2, a: 1 });
  const secondDigest = await digestObject({ a: 1, b: 2 });
  assert.equal(firstDigest, secondDigest);
  assert.match(firstDigest, /^[0-9a-f]{64}$/);

  const firstRoll = await deterministicD10("fixed-seed", "primary");
  const secondRoll = await deterministicD10("fixed-seed", "primary");
  assert.equal(firstRoll, secondRoll);
  assert.ok(firstRoll >= 1 && firstRoll <= 10);
});

test("deterministic indexes stay inside their requested domain", async () => {
  for (let size = 1; size <= 17; size += 1) {
    const index = await deterministicIndex("domain-seed", `size-${size}`, size);
    assert.ok(index >= 0);
    assert.ok(index < size);
  }
});
