import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_AP,
  openTurn,
  quoteAction,
  spendAction,
  validateCommanderCard,
} from "../site/lib/action-economy.mjs";
import {
  abilityModifier,
  resolveCheck,
  roundHalfAwayFromZero,
  scaleD20DC,
} from "../site/lib/d10.mjs";
import { DEALER_CARDS } from "../site/lib/dealer.mjs";

test("ability modifier follows the published scaled d10 table", () => {
  const expected = new Map([
    [4, -2], [5, -2],
    [6, -1], [7, -1],
    [8, -1], [9, -1],
    [10, 0], [11, 0],
    [12, 1], [13, 1],
    [14, 1], [15, 1],
    [16, 2], [17, 2],
    [18, 2], [19, 2],
    [20, 3],
  ]);

  for (const [score, modifier] of expected) {
    assert.equal(abilityModifier(score), modifier, `score ${score}`);
  }
  assert.equal(roundHalfAwayFromZero(-0.5), -1);
  assert.equal(roundHalfAwayFromZero(0.5), 1);
});
test("d20 difficulty classes scale to the controlling d10 tiers", () => {
  assert.equal(scaleD20DC(5), 3);
  assert.equal(scaleD20DC(10), 5);
  assert.equal(scaleD20DC(15), 8);
  assert.equal(scaleD20DC(20), 10);
  assert.equal(scaleD20DC(25), 13);
});

test("natural threats require a 6+ confirmation", () => {
  const unconfirmed = resolveCheck({
    roll: 10,
    confirmation: 5,
    abilityScore: 10,
    skillRanks: 0,
    dc: 10,
  });
  assert.equal(unconfirmed.threat, "success");
  assert.equal(unconfirmed.confirmed, false);
  assert.equal(unconfirmed.outcome, "success");

  const confirmed = resolveCheck({
    roll: 10,
    confirmation: 6,
    abilityScore: 10,
    skillRanks: 0,
    dc: 13,
  });
  assert.equal(confirmed.confirmed, true);
  assert.equal(confirmed.outcome, "critical_success");

  const confirmedFailure = resolveCheck({
    roll: 1,
    confirmation: 9,
    abilityScore: 20,
    skillRanks: 10,
    dc: 3,
  });
  assert.equal(confirmedFailure.outcome, "critical_failure");
});

test("ActionEconomy is the sole Base-10 pool authority", () => {
  const card = DEALER_CARDS[0];
  const turn = openTurn();
  assert.equal(turn.maximum, MAX_AP);
  assert.equal(turn.remaining, 10);

  const quote = quoteAction(card.base_cost, card);
  assert.equal(quote.base_cost, 4);
  assert.equal(quote.card_modifier, -1);
  assert.equal(quote.effective_cost, 3);

  const spent = spendAction(turn, card.base_cost, card);
  assert.equal(spent.turn.maximum, 10);
  assert.equal(spent.turn.remaining, 7);
  assert.equal(spent.turn.spent, 3);
});

test("Commander cards cannot smuggle an absolute AP pool", () => {
  assert.throws(
    () => validateCommanderCard({ ap_modifier: 0, max_ap: 99 }),
    /may not define absolute AP/,
  );
  assert.throws(
    () => validateCommanderCard({ ap_modifier: 0, action_points: 24 }),
    /may not define absolute AP/,
  );
});
