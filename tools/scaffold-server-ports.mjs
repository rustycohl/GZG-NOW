import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const productRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portsRoot = join(productRoot, "ports");
const sourceLib = join(productRoot, "site", "lib");

const cards = [
  {
    id: "ORACLE",
    tier: 2,
    accent: "#43e8e1",
    purpose: "Ephemeral Ghost ingress, local claims, signatures, and evidence identity.",
    boundary: "The alpha uses an in-memory Ed25519 development session, not a JOKE wallet.",
    dependencies: [],
    modules: ["core.mjs", "oracle.mjs", "ledger.mjs"],
    selfTest: `
import { appendEvent, verifyLedger } from "./lib/ledger.mjs";
import {
  claimOracleIdentity,
  createOracleIdentity,
  verifyIdentityClaim,
} from "./lib/oracle.mjs";

export async function runSelfTest() {
  const ghost = await createOracleIdentity();
  let ledger = await appendEvent([], ghost, "ORACLE_GHOST_ENTERED", {
    mode: "server-card-self-test",
  });
  const claimed = await claimOracleIdentity(ghost, "Port Test");
  ledger = await appendEvent(ledger, claimed, "ORACLE_SESSION_CLAIMED", {
    claim: claimed.claim,
  });
  const claimValid = await verifyIdentityClaim(claimed);
  const ledgerReport = await verifyLedger(ledger);
  return {
    pass: claimValid && ledgerReport.valid,
    summary: "Ghost → claim → signed evidence",
    checks: [
      { name: "Ed25519 claim", pass: claimValid },
      { name: "Hash-linked ledger", pass: ledgerReport.valid },
    ],
    evidence: {
      oracle_id: claimed.oracle_id,
      events: ledgerReport.count,
      chain_status: "unanchored",
    },
  };
}
`,
  },
  {
    id: "d10SRD",
    tier: 3,
    accent: "#d6ff2f",
    purpose: "Scaled d20-to-d10 resolution with the published ability table and confirmed threats.",
    boundary: "This port proves the core check only; setting and franchise material live elsewhere.",
    dependencies: [],
    modules: ["core.mjs", "d10.mjs"],
    selfTest: `
import { abilityModifier, resolveCheck, scaleD20DC } from "./lib/d10.mjs";

export async function runSelfTest() {
  const tableValid = abilityModifier(5) === -2
    && abilityModifier(12) === 1
    && abilityModifier(20) === 3;
  const tiersValid = [5, 10, 15, 20, 25]
    .map(scaleD20DC)
    .join(",") === "3,5,8,10,13";
  const result = resolveCheck({
    roll: 10,
    confirmation: 6,
    abilityScore: 12,
    skillRanks: 2,
    dc: 13,
  });
  const criticalValid = result.outcome === "critical_success";
  return {
    pass: tableValid && tiersValid && criticalValid,
    summary: "Published table → scaled tiers → confirmed threat",
    checks: [
      { name: "Ability table", pass: tableValid },
      { name: "DC 3/5/8/10/13", pass: tiersValid },
      { name: "Natural 10 confirms on 6+", pass: criticalValid },
    ],
    evidence: result,
  };
}
`,
  },
  {
    id: "xCommand",
    tier: 4,
    accent: "#ff8b3d",
    purpose: "Deterministic tactical authority with a strict Base-10 action economy.",
    boundary: "This extracted alpha proves AP authority, not the full Godot tactical engine.",
    dependencies: ["d10SRD"],
    modules: ["action-economy.mjs"],
    selfTest: `
import {
  MAX_AP,
  openTurn,
  spendAction,
  validateCommanderCard,
} from "./lib/action-economy.mjs";

export async function runSelfTest() {
  const card = { id: "self-test", ap_modifier: -1 };
  validateCommanderCard(card);
  const spent = spendAction(openTurn(), 4, card);
  let absoluteRejected = false;
  try {
    validateCommanderCard({ ap_modifier: 0, max_ap: 24 });
  } catch {
    absoluteRejected = true;
  }
  return {
    pass: spent.turn.maximum === MAX_AP
      && spent.turn.remaining === 7
      && absoluteRejected,
    summary: "10 AP authority → card modifier → guarded spend",
    checks: [
      { name: "Maximum stays 10", pass: spent.turn.maximum === 10 },
      { name: "Modifier changes cost", pass: spent.quote.effective_cost === 3 },
      { name: "Absolute card AP rejected", pass: absoluteRejected },
    ],
    evidence: spent,
  };
}
`,
  },
  {
    id: "DEALER",
    tier: 4,
    accent: "#ff3d9a",
    purpose: "Card and payload injection through independently verifiable Commander Cards.",
    boundary: "The Decker-Deck alpha carries three development cards and no chain ownership.",
    dependencies: ["xCommand"],
    modules: ["action-economy.mjs", "dealer.mjs"],
    selfTest: `
import { validateCommanderCard } from "./lib/action-economy.mjs";
import { DEALER_CARDS, getCommanderCard } from "./lib/dealer.mjs";

export async function runSelfTest() {
  const cardsValid = DEALER_CARDS.every((card) => {
    validateCommanderCard(card);
    return !Object.hasOwn(card, "max_ap") && !Object.hasOwn(card, "ap");
  });
  const lookupValid = getCommanderCard("dealer:operator").callsign === "OPERATOR";
  return {
    pass: cardsValid && lookupValid && DEALER_CARDS.length === 3,
    summary: "Deck registry → modifier guard → deterministic lookup",
    checks: [
      { name: "Three alpha cards", pass: DEALER_CARDS.length === 3 },
      { name: "No absolute AP", pass: cardsValid },
      { name: "Stable card lookup", pass: lookupValid },
    ],
    evidence: {
      cards: DEALER_CARDS.map(({ id, callsign, ap_modifier }) => ({
        id,
        callsign,
        ap_modifier,
      })),
    },
  };
}
`,
  },
  {
    id: "MARK",
    tier: 1,
    accent: "#d6ff2f",
    purpose: "Generic, deterministic games for the JOKE wallet layer.",
    boundary: "This alpha proves one no-wager MARK challenge; it has no live JOKE settlement.",
    dependencies: ["d10SRD", "xCommand", "DEALER"],
    modules: [
      "core.mjs",
      "d10.mjs",
      "action-economy.mjs",
      "dealer.mjs",
      "mark.mjs",
    ],
    selfTest: `
import { openTurn, spendAction } from "./lib/action-economy.mjs";
import { DEALER_CARDS } from "./lib/dealer.mjs";
import { createMarkChallenge, resolveMarkChallenge } from "./lib/mark.mjs";

export async function runSelfTest() {
  const card = DEALER_CARDS[0];
  const first = await createMarkChallenge("independent-port-seed", 1);
  const replay = await createMarkChallenge("independent-port-seed", 1);
  const action = spendAction(openTurn(), card.base_cost, card);
  const result = await resolveMarkChallenge({
    sessionSeed: "independent-port-seed",
    challenge: first,
    card,
    actionQuote: action.quote,
  });
  const deterministic = JSON.stringify(first) === JSON.stringify(replay);
  return {
    pass: deterministic
      && result.check.roll >= 1
      && result.check.roll <= 10
      && action.turn.maximum === 10,
    summary: "Seed → challenge → card → scaled d10 result",
    checks: [
      { name: "Challenge replays", pass: deterministic },
      { name: "d10 bounded", pass: result.check.roll >= 1 && result.check.roll <= 10 },
      { name: "Base-10 authority", pass: action.turn.maximum === 10 },
    ],
    evidence: result,
  };
}
`,
  },
  {
    id: "P2Pm",
    tier: 1,
    accent: "#ff8b3d",
    purpose: "Point to Point Media artifact work, evidence binding, and portable ownership state.",
    boundary: "This alpha proves browser SHA-256 mint work; peer transport and yield are not implemented.",
    dependencies: ["ORACLE"],
    modules: ["core.mjs", "oracle.mjs", "ledger.mjs", "p2pm.mjs"],
    selfTest: `
import { appendEvent, deriveArtifactOwnership } from "./lib/ledger.mjs";
import { claimOracleIdentity, createOracleIdentity } from "./lib/oracle.mjs";
import {
  buildArtifactCandidate,
  mineArtifact,
  verifyArtifact,
} from "./lib/p2pm.mjs";

export async function runSelfTest() {
  const identity = await claimOracleIdentity(
    await createOracleIdentity(),
    "P2Pm Port",
  );
  let ledger = await appendEvent([], identity, "ORACLE_SESSION_CLAIMED", {
    claim: identity.claim,
  });
  const markResult = {
    schema: "gzg.mark.result/0.1",
    port_test: true,
    outcome: "portable",
  };
  const candidate = await buildArtifactCandidate({ identity, ledger, markResult });
  const artifact = await mineArtifact(candidate, { difficulty: 1 });
  const proof = await verifyArtifact(artifact);
  ledger = await appendEvent(ledger, identity, "P2PM_ARTIFACT_MINTED", {
    artifact_id: artifact.artifact_id,
    owner: identity.oracle_id,
    proof: artifact.proof,
    chain_status: "unanchored",
  });
  const ownership = deriveArtifactOwnership(ledger, artifact.artifact_id);
  return {
    pass: proof.valid
      && ownership.status === "active"
      && ownership.owner === identity.oracle_id,
    summary: "Claimed identity → literal work → derived owner",
    checks: [
      { name: "Proof valid", pass: proof.valid },
      { name: "Owner derived", pass: ownership.owner === identity.oracle_id },
      { name: "No fake chain", pass: candidate.chain_anchor.status === "not-implemented" },
    ],
    evidence: {
      artifact_id: artifact.artifact_id,
      attempts: artifact.proof.attempts,
      owner: ownership.owner,
      chain_status: candidate.chain_anchor.status,
    },
  };
}
`,
  },
];

const shellCss = `
:root {
  color-scheme: dark;
  --ink: #090b0f;
  --panel: #11171e;
  --paper: #f1f5ec;
  --muted: #8f9b95;
  --line: rgba(241, 245, 236, 0.17);
  --accent: #d6ff2f;
  --mono: "Cascadia Mono", Consolas, monospace;
  --display: "Arial Narrow", Impact, sans-serif;
}
* { box-sizing: border-box; }
body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background:
    linear-gradient(rgba(214,255,47,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(214,255,47,.035) 1px, transparent 1px),
    radial-gradient(circle at 82% 8%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 30rem),
    var(--ink);
  background-size: 48px 48px, 48px 48px, auto, auto;
  color: var(--paper);
  font-family: system-ui, sans-serif;
}
main, footer { width: min(1120px, calc(100% - 2rem)); margin-inline: auto; }
header { display: flex; min-height: 58px; padding: .7rem clamp(1rem,4vw,4rem); align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); font: 700 .65rem var(--mono); letter-spacing:.12em; }
header b { color:var(--accent); }
.hero { display:grid; grid-template-columns:1fr auto; gap:3rem; align-items:end; min-height:62vh; padding:clamp(5rem,12vh,9rem) 0 4rem; }
.eyebrow { margin:0 0 1rem; color:var(--accent); font:900 .68rem var(--mono); letter-spacing:.16em; }
h1 { margin:0; font:900 clamp(5rem,18vw,12rem)/.72 var(--display); letter-spacing:-.06em; }
.purpose { max-width:720px; margin:2rem 0 0; font-size:clamp(1.2rem,2.5vw,2rem); font-weight:800; line-height:1.12; text-transform:uppercase; }
.boundary { max-width:720px; color:var(--muted); }
.flag { width:190px; padding:1.5rem; border:1px solid var(--accent); color:var(--accent); font:800 .65rem/1.6 var(--mono); text-align:center; transform:rotate(2deg); }
.grid { display:grid; grid-template-columns:.75fr 1.25fr; gap:1rem; }
.panel { padding:clamp(1.4rem,4vw,2.5rem); border:1px solid var(--line); background:rgba(17,23,30,.92); }
h2 { margin:0 0 1.5rem; font:900 clamp(2rem,5vw,4rem)/.9 var(--display); }
dl { margin:0; }
dl div { display:grid; grid-template-columns:8rem 1fr; gap:1rem; padding:.8rem 0; border-top:1px solid var(--line); }
dt,dd { margin:0; font: .67rem var(--mono); }
dt { color:var(--muted); } dd { text-align:right; overflow-wrap:anywhere; }
button { width:100%; min-height:52px; border:1px solid var(--accent); background:var(--accent); color:var(--ink); cursor:pointer; font:900 .7rem var(--mono); letter-spacing:.1em; }
button:disabled { opacity:.45; cursor:wait; }
.result { min-height:180px; margin-top:1rem; padding:1rem; border:1px solid var(--line); background:#07090c; font:.7rem/1.6 var(--mono); white-space:pre-wrap; overflow-wrap:anywhere; }
.result[data-state="pass"] { border-color:var(--accent); color:var(--accent); }
.result[data-state="fail"] { border-color:#ff5b5b; color:#ff5b5b; }
.deps { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:1rem; }
.deps a,.deps span { padding:.35rem .55rem; border:1px solid var(--line); color:var(--muted); font:.6rem var(--mono); text-decoration:none; }
.deps a:hover { border-color:var(--accent); color:var(--accent); }
footer { display:flex; min-height:120px; align-items:center; justify-content:space-between; color:var(--muted); font:.6rem var(--mono); }
footer a { color:var(--accent); }
@media(max-width:760px){.hero,.grid{grid-template-columns:1fr}.flag{width:100%;transform:none}.hero{align-items:start}.grid{gap:.75rem}}
`;

const browserApp = `
import { runSelfTest } from "./self-test.mjs";

const button = document.querySelector("#run");
const result = document.querySelector("#result");

async function run() {
  button.disabled = true;
  result.dataset.state = "running";
  result.textContent = "RUNNING INDEPENDENT BROWSER SELF-TEST…";
  try {
    const report = await runSelfTest();
    result.dataset.state = report.pass ? "pass" : "fail";
    result.textContent = [
      report.pass ? "PORT PASS" : "PORT FAIL",
      report.summary,
      "",
      ...report.checks.map((check) => \`\${check.pass ? "✓" : "✕"} \${check.name}\`),
      "",
      JSON.stringify(report.evidence, null, 2),
    ].join("\\n");
  } catch (error) {
    result.dataset.state = "fail";
    result.textContent = \`PORT ERROR\\n\${error.message}\`;
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", run);
run();
`;

function pageHtml(card) {
  const dependencyMarkup = card.dependencies.length
    ? card.dependencies.map((dependency) => (
      `<a href="https://rustycohl.github.io/${dependency}/">${dependency}</a>`
    )).join("")
    : "<span>NO LIVE RUNTIME DEPENDENCY</span>";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#090b0f">
    <meta name="description" content="${card.id} independent Ground Zero Games server-card port.">
    <link rel="stylesheet" href="./styles.css">
    <title>${card.id} // Independent Server Card</title>
  </head>
  <body style="--accent:${card.accent}">
    <header><span>GROUND ZERO GAMES // SERVER CARD</span><b>0.1.0-alpha.1</b></header>
    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">INDEPENDENT PORT // TIER ${card.tier}</p>
          <h1>${card.id}</h1>
          <p class="purpose">${card.purpose}</p>
          <p class="boundary">${card.boundary}</p>
        </div>
        <div class="flag">DEDICATED REPO<br>DEDICATED PAGE<br>NO GAME SERVER</div>
      </section>
      <section class="grid">
        <article class="panel">
          <p class="eyebrow">PORT CONTRACT</p>
          <h2>LIVE ALPHA</h2>
          <dl>
            <div><dt>repository</dt><dd>rustycohl/${card.id}</dd></div>
            <div><dt>page</dt><dd>rustycohl.github.io/${card.id}/</dd></div>
            <div><dt>flag</dt><dd>DEDICATED_REPO_PAGE</dd></div>
            <div><dt>authority</dt><dd>deterministic local evidence</dd></div>
          </dl>
          <div class="deps">${dependencyMarkup}</div>
        </article>
        <article class="panel">
          <p class="eyebrow">EXECUTABLE EVIDENCE</p>
          <h2>SELF-TEST</h2>
          <button id="run" type="button">RUN PORT SELF-TEST</button>
          <pre class="result" id="result" data-state="idle">WAITING…</pre>
        </article>
      </section>
    </main>
    <footer>
      <span>${card.id} // PORT IN A STORM</span>
      <a href="./card.json">CARD.JSON</a>
    </footer>
    <script type="module" src="./app.mjs"></script>
  </body>
</html>
`;
}

function workflowYaml(card) {
  return `name: Verify and publish ${card.id}

on:
  pull_request:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  verify-and-deploy:
    if: github.event_name != 'pull_request'
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - name: Verify independent port
        run: npm test
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@v4

  verify-pull-request:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - run: npm test
`;
}

function readme(card) {
  const dependencies = card.dependencies.length
    ? card.dependencies.map((dependency) => `\`${dependency}\``).join(", ")
    : "none at runtime";
  return `# ${card.id}

${card.purpose}

This is an independent Ground Zero Games server-card port:

- repository: \`rustycohl/${card.id}\`
- Page: https://rustycohl.github.io/${card.id}/
- flag: \`DEDICATED_REPO_PAGE\`
- status: \`alpha\`
- dependencies: ${dependencies}

${card.boundary}

## Verify

\`\`\`text
npm test
\`\`\`

The Page runs the same browser-compatible self-test. It has no external
runtime dependency and does not introduce game-server authority.

## License

Version 0.1 software is available under MIT or Apache-2.0, at your option.
Original documentation is CC BY 4.0. See the license files.
`;
}

function status(card) {
  return `# ${card.id} status

- Version: \`0.1.0-alpha.1\`
- Truth level: working extracted alpha
- Page: https://rustycohl.github.io/${card.id}/
- Repository flag: \`DEDICATED_REPO_PAGE\`
- Automated proof: \`npm test\`
- Browser proof: Page self-test
- Boundary: ${card.boundary}

This port is independently deployable. It does not claim chain settlement,
production security, or completion of later canonical tiers.
`;
}

function cardManifest(card) {
  return {
    schema: "gzg.server-card/0.1",
    id: card.id,
    version: "0.1.0-alpha.1",
    status: "alpha",
    tier: card.tier,
    purpose: card.purpose,
    flag: "DEDICATED_REPO_PAGE",
    repository: {
      required: true,
      independent: true,
      full_name: `rustycohl/${card.id}`,
    },
    page: {
      required: true,
      url: `https://rustycohl.github.io/${card.id}/`,
    },
    authority: {
      game_server: "none",
      state: "deterministic-local-evidence",
      joke_chain: "not-implemented",
    },
    dependencies: card.dependencies.map((id) => ({
      id,
      page: `https://rustycohl.github.io/${id}/`,
      runtime_required: false,
    })),
  };
}

async function writeText(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content.trimStart().replace(/\s+$/u, "") + "\n", "utf8");
}

async function scaffold(card) {
  const root = resolve(portsRoot, card.id);
  if (!root.startsWith(`${resolve(portsRoot)}\\`) && !root.startsWith(`${resolve(portsRoot)}/`)) {
    throw new Error(`Refusing to write outside ports root: ${root}`);
  }

  await mkdir(join(root, "site", "lib"), { recursive: true });
  for (const moduleName of card.modules) {
    await cp(join(sourceLib, moduleName), join(root, "site", "lib", moduleName));
  }

  const manifest = cardManifest(card);
  await writeText(join(root, "card.json"), JSON.stringify(manifest, null, 2));
  await writeText(join(root, "site", "card.json"), JSON.stringify(manifest, null, 2));
  await writeText(join(root, "site", "index.html"), pageHtml(card));
  await writeText(join(root, "site", "styles.css"), shellCss);
  await writeText(join(root, "site", "app.mjs"), browserApp);
  await writeText(join(root, "site", "self-test.mjs"), card.selfTest);
  await writeText(join(root, "site", ".nojekyll"), "");
  await writeText(join(root, "README.md"), readme(card));
  await writeText(join(root, "STATUS.md"), status(card));
  await writeText(join(root, "NOTICE"), `${card.id}\nCopyright 2026 Rusty Cohl and contributors\n`);
  await writeText(join(root, ".gitattributes"), "* text=auto eol=lf\n");
  await writeText(join(root, ".gitignore"), "node_modules/\n*.log\n");
  await writeText(join(root, ".github", "workflows", "pages.yml"), workflowYaml(card));
  await writeText(
    join(root, "package.json"),
    JSON.stringify({
      name: card.id.toLowerCase(),
      version: "0.1.0-alpha.1",
      private: true,
      type: "module",
      scripts: {
        test: "node --test",
      },
      license: "(MIT OR Apache-2.0)",
    }, null, 2),
  );
  await writeText(
    join(root, "tests", "port.test.mjs"),
    `import assert from "node:assert/strict";
import test from "node:test";
import { runSelfTest } from "../site/self-test.mjs";

test("${card.id} independent port self-test", async () => {
  const report = await runSelfTest();
  assert.equal(report.pass, true, JSON.stringify(report, null, 2));
});
`,
  );
  await cp(join(productRoot, "LICENSE"), join(root, "LICENSE"));
  await cp(join(productRoot, "LICENSE-MIT"), join(root, "LICENSE-MIT"));
  await cp(join(productRoot, "LICENSE-APACHE"), join(root, "LICENSE-APACHE"));
  await cp(
    join(productRoot, "DOCUMENTATION-LICENSE.md"),
    join(root, "DOCUMENTATION-LICENSE.md"),
  );
  return relative(productRoot, root);
}

await mkdir(portsRoot, { recursive: true });
const created = [];
for (const card of cards) {
  created.push(await scaffold(card));
}
process.stdout.write(`${created.join("\n")}\n`);
