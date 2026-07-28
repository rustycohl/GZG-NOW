import { deterministicIndex, digestObject } from "./core.mjs";
import { rollCheck } from "./d10.mjs";

const CHALLENGES = Object.freeze([
  Object.freeze({
    key: "open-carrier",
    title: "Open carrier",
    dc: 3,
    signal: "A bright carrier crosses the local field.",
  }),
  Object.freeze({
    key: "buried-handshake",
    title: "Buried handshake",
    dc: 5,
    signal: "A structured pulse is hiding under ordinary noise.",
  }),
  Object.freeze({
    key: "moving-window",
    title: "Moving window",
    dc: 8,
    signal: "The target changes phase every time you approach.",
  }),
  Object.freeze({
    key: "dead-channel",
    title: "Dead channel",
    dc: 10,
    signal: "Nothing should be transmitting here. Something is.",
  }),
  Object.freeze({
    key: "black-threshold",
    title: "Black threshold",
    dc: 13,
    signal: "The mark is unreachable without demonstrated competence.",
  }),
]);

export async function createMarkChallenge(sessionSeed, round) {
  if (!sessionSeed || !Number.isInteger(round) || round < 1) {
    throw new TypeError("A session seed and positive round are required.");
  }
  const index = await deterministicIndex(sessionSeed, `mark-challenge:${round}`, CHALLENGES.length);
  const template = CHALLENGES[index];
  const challenge = {
    schema: "gzg.mark.challenge/0.1",
    round,
    key: template.key,
    title: template.title,
    signal: template.signal,
    dc: template.dc,
  };
  return {
    ...challenge,
    challenge_id: `mark:${(await digestObject(challenge)).slice(0, 20)}`,
  };
}
export async function resolveMarkChallenge({
  sessionSeed,
  challenge,
  card,
  actionQuote,
}) {
  const check = await rollCheck(
    `${sessionSeed}|${challenge.challenge_id}|${card.id}`,
    {
      abilityScore: card.ability_score,
      skillRanks: card.skill_ranks,
      situational: card.situational,
      dc: challenge.dc,
    },
  );

  return {
    schema: "gzg.mark.result/0.1",
    challenge,
    commander: {
      card_id: card.id,
      callsign: card.callsign,
      ability: card.ability,
      ability_score: card.ability_score,
      skill_ranks: card.skill_ranks,
      situational: card.situational,
      ap_modifier: card.ap_modifier,
    },
    action: actionQuote,
    check,
  };
}
