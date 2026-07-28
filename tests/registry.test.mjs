import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registry = JSON.parse(
  await readFile(new URL("../site/card-registry.json", import.meta.url), "utf8"),
);
const products = JSON.parse(
  await readFile(new URL("../site/product-registry.json", import.meta.url), "utf8"),
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

test("the audience-facing release is exactly two products and one SRD", () => {
  assert.equal(products.publication_model, "two products + one SRD");
  assert.deepEqual(
    products.public_release.map((product) => product.id),
    ["BattleStarSol", "X-Command", "d10SRD"],
  );
  assert.equal(
    products.public_release.filter((product) => product.role.includes("rules")).length,
    1,
  );
  assert.match(products.public_release[0].role, /playable/u);
  assert.ok(
    products.public_release.every((product) => (
      product.repository === `rustycohl/${product.id}`
      && product.page === `https://rustycohl.github.io/${product.id}/`
    )),
  );
});

test("A.T.L.A.S. is registered as its own standalone strategic galaxy", () => {
  assert.deepEqual(
    products.standalone_galaxies.map((galaxy) => galaxy.id),
    ["ATLAS"],
  );
  assert.equal(products.standalone_galaxies[0].repository, "rustycohl/ATLAS");
  assert.equal(products.standalone_galaxies[0].page, "https://rustycohl.github.io/ATLAS/");
  assert.ok(products.development_network.includes("ATLAS"));
});
