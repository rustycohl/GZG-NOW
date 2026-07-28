import { openTurn, spendAction } from "./lib/action-economy.mjs";
import { digestObject, randomHex } from "./lib/core.mjs";
import { DEALER_CARDS, getCommanderCard } from "./lib/dealer.mjs";
import {
  appendEvent,
  deriveArtifactOwnership,
  verifyLedger,
} from "./lib/ledger.mjs";
import { createMarkChallenge, resolveMarkChallenge } from "./lib/mark.mjs";
import {
  claimOracleIdentity,
  createOracleIdentity,
  publicIdentity,
  verifyIdentityClaim,
} from "./lib/oracle.mjs";
import {
  buildArtifactCandidate,
  mineArtifact,
  verifyArtifact,
} from "./lib/p2pm.mjs";

const BUILD = "0.1.0-alpha.2";

const state = {
  identity: null,
  sessionSeed: null,
  ledger: [],
  selectedCardId: DEALER_CARDS[0].id,
  turn: openTurn(1),
  round: 1,
  challenge: null,
  lastMark: null,
  artifact: null,
  artifactRound: null,
  busy: false,
};

const byId = (id) => document.getElementById(id);
const elements = {
  bootStatus: byId("boot-status"),
  identityState: byId("identity-state"),
  identityShort: byId("identity-short"),
  oracleStatePill: byId("oracle-state-pill"),
  oracleId: byId("oracle-id"),
  claimForm: byId("claim-form"),
  handle: byId("handle"),
  claimButton: byId("claim-button"),
  deck: byId("dealer-deck"),
  apRemaining: byId("ap-remaining"),
  turnNumber: byId("turn-number"),
  ledgerCount: byId("ledger-count"),
  ledgerHead: byId("ledger-head"),
  proofState: byId("proof-state"),
  markRound: byId("mark-round"),
  markTitle: byId("mark-title"),
  markSignal: byId("mark-signal"),
  markDc: byId("mark-dc"),
  playButton: byId("play-button"),
  newTurnButton: byId("new-turn-button"),
  result: byId("mark-result"),
  resultRoll: byId("result-roll"),
  resultLabel: byId("result-label"),
  resultEquation: byId("result-equation"),
  resultDetail: byId("result-detail"),
  mintButton: byId("mint-button"),
  mintProgress: byId("mint-progress"),
  workMeterFill: byId("work-meter-fill"),
  artifactId: byId("artifact-id"),
  artifactProof: byId("artifact-proof"),
  verifyButton: byId("verify-button"),
  exportButton: byId("export-button"),
  resetButton: byId("reset-button"),
  verification: byId("verification"),
  ledgerList: byId("ledger-list"),
};

function shortHash(value, start = 12, end = 8) {
  if (!value) {
    return "—";
  }
  return value.length <= start + end + 1
    ? value
    : `${value.slice(0, start)}…${value.slice(-end)}`;
}

function setBusy(busy, message = null) {
  state.busy = busy;
  for (const button of document.querySelectorAll("button")) {
    button.disabled = busy;
  }
  if (message) {
    elements.bootStatus.textContent = message;
  } else if (!busy) {
    elements.bootStatus.textContent = "LOCAL PROTOCOL READY";
  }
  renderControls();
}

function renderControls() {
  const claimed = state.identity?.status === "claimed";
  const hasResult = Boolean(state.lastMark);
  const resultAlreadyMinted = state.artifactRound === state.lastMark?.challenge?.round;

  elements.claimButton.disabled = state.busy || claimed;
  elements.handle.disabled = state.busy || claimed;
  elements.playButton.disabled = state.busy || !state.challenge;
  elements.newTurnButton.disabled = state.busy || state.turn.spent === 0;
  elements.mintButton.disabled = (
    state.busy
    || !claimed
    || !hasResult
    || resultAlreadyMinted
  );
  elements.verifyButton.disabled = state.busy || state.ledger.length === 0;
  elements.exportButton.disabled = state.busy || state.ledger.length === 0;
  elements.resetButton.disabled = state.busy;
}

function renderDeck() {
  elements.deck.replaceChildren();
  for (const card of DEALER_CARDS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "commander-card";
    button.dataset.selected = String(card.id === state.selectedCardId);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(card.id === state.selectedCardId));
    button.dataset.cardId = card.id;

    const sigil = document.createElement("span");
    sigil.className = "commander-card__sigil";
    sigil.textContent = card.sigil;

    const role = document.createElement("small");
    role.textContent = card.role;

    const title = document.createElement("strong");
    title.textContent = card.callsign;

    const method = document.createElement("p");
    method.textContent = card.method;

    const stats = document.createElement("span");
    stats.className = "commander-card__stats";
    const modifier = card.ap_modifier > 0 ? `+${card.ap_modifier}` : card.ap_modifier;
    stats.textContent = `${card.ability} ${card.ability_score} // SKILL ${card.skill_ranks} // AP ${modifier}`;

    button.append(sigil, role, title, method, stats);
    button.addEventListener("click", () => {
      if (state.busy) {
        return;
      }
      state.selectedCardId = card.id;
      renderDeck();
    });
    elements.deck.append(button);
  }
}

function renderIdentity() {
  const identity = state.identity;
  const label = identity?.status === "claimed" ? "CLAIMED" : "GHOST";
  elements.identityState.textContent = label;
  elements.oracleStatePill.textContent = label;
  elements.oracleStatePill.dataset.state = identity?.status ?? "ghost";
  elements.identityShort.textContent = identity
    ? shortHash(identity.fingerprint, 10, 6)
    : "generating local key…";
  elements.oracleId.textContent = identity
    ? shortHash(identity.oracle_id, 18, 8)
    : "—";
  if (identity?.status === "claimed") {
    elements.handle.value = identity.handle;
  }
}

function renderTurn() {
  elements.apRemaining.textContent = String(state.turn.remaining);
  elements.turnNumber.textContent = String(state.turn.turn);
}

function renderChallenge() {
  if (!state.challenge) {
    return;
  }
  elements.markRound.textContent = String(state.challenge.round);
  elements.markTitle.textContent = state.challenge.title;
  elements.markSignal.textContent = state.challenge.signal;
  elements.markDc.textContent = String(state.challenge.dc);
}

function renderResult() {
  if (!state.lastMark) {
    elements.result.dataset.outcome = "waiting";
    elements.resultRoll.textContent = "—";
    elements.resultLabel.textContent = "AWAITING ACTION";
    elements.resultEquation.textContent = "d10 + ability + skill vs. DC";
    elements.resultDetail.textContent = "Natural 1 and 10 threats confirm on 6+.";
    return;
  }

  const { check } = state.lastMark;
  const readableOutcome = check.outcome.replaceAll("_", " ").toUpperCase();
  elements.result.dataset.outcome = check.outcome;
  elements.resultRoll.textContent = String(check.roll);
  elements.resultLabel.textContent = readableOutcome;
  elements.resultEquation.textContent = (
    `${check.roll} + ${check.ability_modifier} + ${check.skill_ranks}`
    + `${check.situational ? ` + ${check.situational}` : ""}`
    + ` = ${check.total} vs. DC ${check.dc}`
  );
  elements.resultDetail.textContent = check.threat
    ? `Natural ${check.roll} threat // confirmation ${check.confirmation}`
      + `${check.confirmed ? " // CONFIRMED" : " // not confirmed"}`
    : `${state.lastMark.commander.callsign} spent ${state.lastMark.action.effective_cost} AP.`;
}

function renderArtifact() {
  if (!state.artifact) {
    elements.proofState.textContent = "UNMINTED";
    elements.artifactId.textContent = "—";
    elements.artifactProof.textContent = "not computed";
    elements.workMeterFill.style.width = "0%";
    return;
  }
  elements.proofState.textContent = "LOCAL PROOF";
  elements.artifactId.textContent = shortHash(state.artifact.artifact_id, 18, 10);
  elements.artifactProof.textContent = (
    `nonce ${state.artifact.proof.nonce.toLocaleString()}`
    + ` / ${state.artifact.proof.attempts.toLocaleString()} attempts`
  );
  elements.workMeterFill.style.width = "100%";
}

function renderLedger() {
  elements.ledgerCount.textContent = `${state.ledger.length} event${state.ledger.length === 1 ? "" : "s"}`;
  elements.ledgerHead.textContent = shortHash(state.ledger.at(-1)?.id ?? "GENESIS", 10, 6);
  elements.ledgerList.replaceChildren();

  for (const entry of [...state.ledger].reverse()) {
    const item = document.createElement("li");

    const sequence = document.createElement("span");
    sequence.className = "ledger__sequence";
    sequence.textContent = String(entry.record.sequence).padStart(2, "0");

    const body = document.createElement("div");
    const type = document.createElement("strong");
    type.textContent = entry.record.type.replaceAll("_", " ");
    const actor = document.createElement("small");
    actor.textContent = `${entry.record.actor.status} // ${shortHash(entry.record.actor.oracle_id, 15, 6)}`;
    body.append(type, actor);

    const hash = document.createElement("code");
    hash.textContent = shortHash(entry.id, 12, 10);

    item.append(sequence, body, hash);
    elements.ledgerList.append(item);
  }
}

function renderAll() {
  renderIdentity();
  renderDeck();
  renderTurn();
  renderChallenge();
  renderResult();
  renderArtifact();
  renderLedger();
  renderControls();
}

function reportError(error) {
  console.error(error);
  elements.verification.dataset.state = "invalid";
  elements.verification.textContent = error?.message ?? "The local protocol stopped unexpectedly.";
  elements.bootStatus.textContent = "LOCAL PROTOCOL NEEDS ATTENTION";
}

async function prepareChallenge() {
  state.challenge = await createMarkChallenge(state.sessionSeed, state.round);
}

async function resetSession() {
  setBusy(true, "GENERATING LOCAL ORACLE KEY");
  state.identity = await createOracleIdentity();
  state.sessionSeed = await digestObject({
    schema: "gzg.now.session-seed/0.1",
    oracle_id: state.identity.oracle_id,
    entropy: randomHex(32),
    build: BUILD,
  });
  state.ledger = [];
  state.selectedCardId = DEALER_CARDS[0].id;
  state.turn = openTurn(1);
  state.round = 1;
  state.lastMark = null;
  state.artifact = null;
  state.artifactRound = null;
  state.ledger = await appendEvent(
    state.ledger,
    state.identity,
    "ORACLE_GHOST_ENTERED",
    {
      session_seed: state.sessionSeed,
      mode: "browser-local",
      chain_status: "unanchored",
      build: BUILD,
    },
  );
  await prepareChallenge();
  elements.handle.value = "";
  elements.mintProgress.textContent = "Waiting for a claimed result.";
  elements.verification.dataset.state = "idle";
  elements.verification.textContent = (
    "Run verification to check every event hash, Ed25519 signature, link, "
    + "artifact proof, and derived owner."
  );
  setBusy(false);
  renderAll();
}

async function claimSession(event) {
  event.preventDefault();
  setBusy(true, "SIGNING LOCAL ORACLE CLAIM");
  state.identity = await claimOracleIdentity(state.identity, elements.handle.value);
  state.ledger = await appendEvent(
    state.ledger,
    state.identity,
    "ORACLE_SESSION_CLAIMED",
    {
      claim: state.identity.claim,
      wallet_status: "not-implemented",
    },
  );
  setBusy(false);
  renderAll();
}

async function playMark() {
  setBusy(true, "RESOLVING STRICT CAUSE AND EFFECT");
  const card = getCommanderCard(state.selectedCardId);
  const spent = spendAction(state.turn, card.base_cost, card);
  const result = await resolveMarkChallenge({
    sessionSeed: state.sessionSeed,
    challenge: state.challenge,
    card,
    actionQuote: spent.quote,
  });

  state.turn = spent.turn;
  state.lastMark = result;
  state.artifact = null;
  state.artifactRound = null;
  state.ledger = await appendEvent(
    state.ledger,
    state.identity,
    "MARK_RESOLVED",
    {
      result,
      turn_after: state.turn,
    },
  );
  state.round += 1;
  await prepareChallenge();
  elements.mintProgress.textContent = state.identity.status === "claimed"
    ? "Result ready for local proof-of-work."
    : "Result ready, but Ghosts cannot mint.";
  setBusy(false);
  renderAll();
}

async function openNewTurn() {
  setBusy(true, "OPENING BASE-10 TURN");
  state.turn = openTurn(state.turn.turn + 1);
  state.ledger = await appendEvent(
    state.ledger,
    state.identity,
    "XCOMMAND_TURN_OPENED",
    { turn: state.turn.turn, maximum_ap: state.turn.maximum },
  );
  setBusy(false);
  renderAll();
}

async function mintLatestResult() {
  setBusy(true, "P2Pm WORK IN PROGRESS");
  elements.mintProgress.textContent = "Computing SHA-256 work…";
  elements.workMeterFill.style.width = "7%";

  const candidate = await buildArtifactCandidate({
    identity: state.identity,
    ledger: state.ledger,
    markResult: state.lastMark,
  });
  const artifact = await mineArtifact(candidate, {
    difficulty: 3,
    onProgress: (attempts) => {
      elements.mintProgress.textContent = `${attempts.toLocaleString()} attempts computed locally…`;
      const progress = Math.min(92, 8 + Math.log10(attempts + 1) * 24);
      elements.workMeterFill.style.width = `${progress}%`;
    },
  });

  state.artifact = artifact;
  state.artifactRound = state.lastMark.challenge.round;
  state.ledger = await appendEvent(
    state.ledger,
    state.identity,
    "P2PM_ARTIFACT_MINTED",
    {
      artifact_id: artifact.artifact_id,
      owner: state.identity.oracle_id,
      proof: artifact.proof,
      chain_status: "unanchored",
    },
  );
  elements.mintProgress.textContent = (
    `Proof found after ${artifact.proof.attempts.toLocaleString()} local attempts.`
  );
  setBusy(false);
  renderAll();
}

async function verifyAll() {
  setBusy(true, "VERIFYING PORTABLE EVIDENCE");
  const ledgerReport = await verifyLedger(state.ledger);
  const claimValid = state.identity.status === "ghost"
    ? true
    : await verifyIdentityClaim(state.identity);
  const artifactReport = state.artifact
    ? await verifyArtifact(state.artifact)
    : { valid: true, errors: [] };
  const ownership = state.artifact
    ? deriveArtifactOwnership(state.ledger, state.artifact.artifact_id)
    : null;
  const ownershipValid = !state.artifact || (
    ownership.status === "active"
    && ownership.owner === state.identity.oracle_id
  );

  const valid = ledgerReport.valid && claimValid && artifactReport.valid && ownershipValid;
  elements.verification.dataset.state = valid ? "valid" : "invalid";
  elements.verification.textContent = valid
    ? (
      `VERIFIED // ${ledgerReport.count} signed events`
      + `${state.artifact ? " // proof valid // owner derived from ledger" : ""}`
      + " // no chain settlement claimed"
    )
    : [
      ...ledgerReport.errors,
      ...artifactReport.errors,
      ...(!claimValid ? ["Local ORACLE claim signature invalid."] : []),
      ...(!ownershipValid ? ["Artifact owner could not be derived."] : []),
    ].join(" ");
  setBusy(false);
  renderControls();
}

function exportBundle() {
  const bundle = {
    schema: "gzg.now.portable-bundle/0.1",
    build: BUILD,
    transport_metadata: {
      exported_at: new Date().toISOString(),
      note: "Wall-clock time is not part of signed protocol state.",
    },
    identity: publicIdentity(state.identity),
    session_seed: state.sessionSeed,
    ledger: state.ledger,
    artifact: state.artifact,
    boundaries: {
      game_server: "none",
      joke_chain: "not-implemented",
      neural_token: "not-implemented",
      value: "none",
    },
  };
  const blob = new Blob([`${JSON.stringify(bundle, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gzg-now-${state.sessionSeed.slice(0, 12)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function safely(operation) {
  try {
    await operation();
  } catch (error) {
    state.busy = false;
    reportError(error);
    renderAll();
  }
}

elements.claimForm.addEventListener("submit", (event) => safely(() => claimSession(event)));
elements.playButton.addEventListener("click", () => safely(playMark));
elements.newTurnButton.addEventListener("click", () => safely(openNewTurn));
elements.mintButton.addEventListener("click", () => safely(mintLatestResult));
elements.verifyButton.addEventListener("click", () => safely(verifyAll));
elements.exportButton.addEventListener("click", exportBundle);
elements.resetButton.addEventListener("click", () => safely(resetSession));

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Offline support is optional; the protocol remains usable without it.
  });
}

safely(resetSession);
