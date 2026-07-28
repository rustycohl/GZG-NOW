import assert from "node:assert/strict";
import test from "node:test";

import { openTurn, spendAction } from "../site/lib/action-economy.mjs";
import { DEALER_CARDS } from "../site/lib/dealer.mjs";
import {
  appendEvent,
  deriveArtifactOwnership,
  verifyLedger,
} from "../site/lib/ledger.mjs";
import { createMarkChallenge, resolveMarkChallenge } from "../site/lib/mark.mjs";
import {
  claimOracleIdentity,
  createOracleIdentity,
  verifyIdentityClaim,
} from "../site/lib/oracle.mjs";
import {
  buildArtifactCandidate,
  mineArtifact,
  verifyArtifact,
} from "../site/lib/p2pm.mjs";

test("signed event ledgers verify and expose tampering", async () => {
  const identity = await createOracleIdentity();
  let ledger = await appendEvent([], identity, "ORACLE_GHOST_ENTERED", {
    session_seed: "test-seed",
  });
  ledger = await appendEvent(ledger, identity, "MARK_RESOLVED", {
    result: "test",
  });

  const valid = await verifyLedger(ledger);
  assert.equal(valid.valid, true);
  assert.equal(valid.count, 2);

  const tampered = structuredClone(ledger);
  tampered[0].record.payload.session_seed = "changed";
  const invalid = await verifyLedger(tampered);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes("identifier mismatch")));
  assert.ok(invalid.errors.some((error) => error.includes("signature invalid")));
});
test("Ghosts cannot mint and claimed local sessions can", async () => {
  const ghost = await createOracleIdentity();
  let ledger = await appendEvent([], ghost, "ORACLE_GHOST_ENTERED", {
    session_seed: "protocol-seed",
  });
  const card = DEALER_CARDS[1];
  const challenge = await createMarkChallenge("protocol-seed", 1);
  const spent = spendAction(openTurn(), card.base_cost, card);
  const result = await resolveMarkChallenge({
    sessionSeed: "protocol-seed",
    challenge,
    card,
    actionQuote: spent.quote,
  });
  ledger = await appendEvent(ledger, ghost, "MARK_RESOLVED", { result });

  await assert.rejects(
    () => buildArtifactCandidate({ identity: ghost, ledger, markResult: result }),
    /Ghost sessions cannot mint/,
  );

  const claimed = await claimOracleIdentity(ghost, "Test Operator");
  assert.equal(await verifyIdentityClaim(claimed), true);
  ledger = await appendEvent(ledger, claimed, "ORACLE_SESSION_CLAIMED", {
    claim: claimed.claim,
  });

  const candidate = await buildArtifactCandidate({
    identity: claimed,
    ledger,
    markResult: result,
  });
  assert.equal(candidate.owner, claimed.oracle_id);
  assert.equal(candidate.chain_anchor.status, "not-implemented");

  const artifact = await mineArtifact(candidate, { difficulty: 1 });
  const artifactReport = await verifyArtifact(artifact);
  assert.equal(artifactReport.valid, true);

  ledger = await appendEvent(ledger, claimed, "P2PM_ARTIFACT_MINTED", {
    artifact_id: artifact.artifact_id,
    owner: claimed.oracle_id,
    proof: artifact.proof,
    chain_status: "unanchored",
  });
  const ownership = deriveArtifactOwnership(ledger, artifact.artifact_id);
  assert.equal(ownership.status, "active");
  assert.equal(ownership.owner, claimed.oracle_id);

  const finalLedgerReport = await verifyLedger(ledger);
  assert.equal(finalLedgerReport.valid, true);
});

test("artifact proof binds the full candidate", async () => {
  const identity = await claimOracleIdentity(await createOracleIdentity(), "Proof Tester");
  const ledger = await appendEvent([], identity, "ORACLE_SESSION_CLAIMED", {
    claim: identity.claim,
  });
  const candidate = {
    schema: "gzg.p2pm.artifact-candidate/0.1",
    owner: identity.oracle_id,
    content: { result: "bound" },
    evidence: { ledger_head: ledger[0].id },
    chain_anchor: { network: "JOKE", status: "not-implemented", transaction: null },
  };
  const artifact = await mineArtifact(candidate, { difficulty: 1 });
  const tampered = structuredClone(artifact);
  tampered.candidate.content.result = "rewritten";

  assert.equal((await verifyArtifact(artifact)).valid, true);
  assert.equal((await verifyArtifact(tampered)).valid, false);
});

test("MARK challenges and results replay deterministically", async () => {
  const card = DEALER_CARDS[2];
  const challengeA = await createMarkChallenge("replay-seed", 7);
  const challengeB = await createMarkChallenge("replay-seed", 7);
  assert.deepEqual(challengeA, challengeB);

  const action = spendAction(openTurn(), card.base_cost, card);
  const first = await resolveMarkChallenge({
    sessionSeed: "replay-seed",
    challenge: challengeA,
    card,
    actionQuote: action.quote,
  });
  const second = await resolveMarkChallenge({
    sessionSeed: "replay-seed",
    challenge: challengeB,
    card,
    actionQuote: action.quote,
  });
  assert.deepEqual(first, second);
});
