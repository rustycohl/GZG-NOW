import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registry = JSON.parse(
  await readFile(new URL("../site/card-registry.json", import.meta.url), "utf8"),
);

test("every published server card carries the dedicated repo/Page flag", () => {
  assert.equal(registry.flag, "DEDICATED_REPO_PAGE");
  assert.equal(registry.cards.length, 6);

  for (const card of registry.cards) {
    assert.equal(card.status, "alpha");
    assert.match(card.repository, /^rustycohl\/[^/]+$/u);
    assert.equal(card.repository, `rustycohl/${card.id}`);
    assert.equal(card.page, `https://rustycohl.github.io/${card.id}/`);
  }
});

test("server-card ports are unique and independent of the product repo", () => {
  const repositories = registry.cards.map((card) => card.repository);
  const pages = registry.cards.map((card) => card.page);

  assert.equal(new Set(repositories).size, registry.cards.length);
  assert.equal(new Set(pages).size, registry.cards.length);
  assert.ok(!repositories.includes("rustycohl/GZG-NOW"));
});

test("the first live port set covers the complete alpha evidence loop", () => {
  assert.deepEqual(
    registry.cards.map((card) => card.id).sort(),
    ["DEALER", "MARK", "ORACLE", "P2Pm", "d10SRD", "xCommand"].sort(),
  );
});
