# Product Designer Multi-Agent System

A Claude Code subagent system optimized for **Senior IC Product Designers** working across the full discovery → handoff lifecycle, with embedded Product Management capabilities (prioritization, positioning, competitive analysis).

Built around an **Orchestrator + specialized sub-agents** pattern with per-agent approval gates.

---

## System Architecture

```
                        ┌─────────────────────┐
                        │    orchestrator     │
                        │  (routing + plan)   │
                        └──────────┬──────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
   ┌────▼─────┐              ┌─────▼──────┐             ┌─────▼─────┐
   │ DISCOVERY│              │  DEFINE    │             │  DELIVER  │
   ├──────────┤              ├────────────┤             ├───────────┤
   │ research │              │ positioning│             │ prototype │
   │ competitive│            │ prioritization│          │ usability │
   └──────────┘              │ ideation   │             │ handoff   │
                             └────────────┘             └───────────┘
```

## Agents (18 total)

| Agent | Phase | Voice | Model | Primary MCPs |
|---|---|---|---|---|
| `orchestrator` | Meta | Calm strategist | opus | All |
| `critique-partner` | Cross-cutting | Devil's advocate | opus | All |
| `discovery-researcher` | Discovery | Curious, evidence-first | sonnet | Notion, Web |
| `competitive-analyst` | Discovery | Pattern detective | sonnet | Mobbin, Web, Figma |
| `product-positioner` | Define | Sharp, opinionated | sonnet | Notion, Web |
| `feature-prioritizer` | Define | Tradeoff-honest PM | sonnet | Notion |
| `ideation-facilitator` | Define | Generative, divergent | sonnet | Mobbin, Notion |
| `pm-strategist` | Define | Opinionated strategist | sonnet | Notion, Web |
| `lo-fi-designer` | Define | Pragmatic systems-designer | sonnet | Figma, Mobbin, Web |
| `figma-designer` | Deliver | Figma-native implementer | sonnet | Figma |
| `design-engineer` | Deliver | Shipping-craft engineer | sonnet | Figma, Mobbin |
| `usability-tester` | Deliver | Skeptical scientist | sonnet | Notion |
| `handoff-engineer` | Deliver | Systems-thinker | sonnet | Figma, Notion |
| `pm-launch-architect` | Deliver | Pragmatic GTM lead | sonnet | Notion, Web |
| `pm-metrics-architect` | Cross-cutting | Skeptical instrumentation lead | sonnet | Notion |
| `prd-author` | Deliver | Precise PRD writer | sonnet | — |
| `product-fingerprint-curator` (v4.0) | Cross-cutting | Pattern-extractor | sonnet | Figma |
| `figma-component-bootstrapper` (v4.2) | Cross-cutting (one-time per project) | Pragmatic systems-designer | sonnet | Figma |

`figma-designer` is the Figma-side counterpart to `design-engineer`: same pipeline slot (after `lo-fi-designer`), same hi-fi expectation, different surface. The user picks the Deliver path off the lo-fi handoff — Figma-first (designer-led) or code-first (developer-led). Both can run on the same flow; the second one consumes the first's handoff as reference.

Model routing is deliberate: Opus is expensive, and it earns its keep only on orchestration and adversarial critique. The 13 phase + cross-cutting agents run on Sonnet to keep a full pipeline run in the $1–3 range, not $8+.

## Orchestration Style — Alignment Loop, not Waterfall

The orchestrator's default mode is the **Alignment Loop**:

1. **Diagnose** — opens with at most 2 questions to understand what you actually need
2. **Propose the smallest-next-move** — one agent, one mode, one tight goal
3. **Run** that move
4. **Realign** — present what we learned, propose the next move, you decide

You can `pivot — <new direction>` at any Stop Gate to steer the loop somewhere else. The orchestrator doesn't pre-commit to a 5-phase pipeline; it co-creates the path with you.

When you explicitly want a fixed plan upfront ("plan the full discovery sprint"), the orchestrator falls back to **Waterfall mode** — same Stop Gates between every step.

## Decision Data in chat (v5.0)

Every Stop Gate renders the just-completed sub-agent's `decisionData` as markdown in the chat reply, between the Executive Summary stat-card and the TL;DR. Four shape variants:

- **`insights`** — numbered list with evidence + per-item confidence (discovery-researcher, ideation-facilitator, critique-partner, usability-tester, lo-fi-designer)
- **`table`** — markdown table with right-aligned numeric columns (feature-prioritizer, competitive-analyst, design-engineer, handoff-engineer, prd-author manifest)
- **`callout`** — blockquote with optional 🎯 flavor for beachhead/launch (product-positioner, pm-strategist, pm-launch-architect)
- **`metrics`** — grouped bullet list of measurement-plan layers (pm-metrics-architect)

When an inline-widget tool (`show_widget`) is available, these render as Generative-UI cards from `widgets/<shape>.widget.html` instead of markdown (a UX upgrade, not a token saving — the shell re-emits each render). Three **agent-specific supplemental widgets** go beyond the 4 shapes: `widgets/ia-tree.widget.html` (information-architect — sitemap drilled to screens + action-priority map); `widgets/wireframe.widget.html` (v5.4–v5.5 — lo-fi-designer's layouts as grayscale wireframes: the 3 layout alternatives at region+label, then a section detail loop drilling the chosen layout down to its lo-fi component composition (`name · type · role` labeled boxes), one section per Stop Gate); and `widgets/flow.widget.html` (v5.6 — lo-fi-designer's Journey Map + Userflow as native vertical-spine flow diagrams at the layout-choice gate). In every case the markdown/ASCII/Mermaid/Figjam in the handoff `.md` stays as the durable record + no-widget fallback.

Full shape spec: `DECISION_DATA_SHAPES.md`. The TL;DR (3 bullets — 2 findings + 1 open question) references the Decision Data rather than duplicating it.

This is the post-v5.0 decision surface. Pre-v5.0 versions emitted an HTML `dashboard.html` mirror plus an optional Queue Mode click-driven loop — both ripped in v5.0 because they were never used in practice. See `RATIONALE.md` § "Why dashboard was removed (v5.0)" and `CHANGELOG.md` for the history.

## PRDs + Notion sync (v3.5)

After Define is done and Success Metrics are confirmed (v3.4 Gate), two new capabilities are available:

### `prd-author` agent

Iterates the confirmed `feature-prioritizer` "in"-tagged items. Generates one PRD per sub-feature using the `pm-execution:create-prd` skill. Writes each PRD to `./design-workspace/<project-slug>/prds/<feature-slug>.md`.

- Token cost: ~$0.10–0.20 per PRD. Batch capped at 8 PRDs per run (scope down if you have more).
- Rendered in the chat's Decision Data block as a manifest table — slug · words · source RICE · status (new/updated).
- Idempotent: re-running on the same project updates existing PRD files; doesn't blindly overwrite.
- Routes naturally after the Success-Metrics Gate clears (orchestrator proposes it as the next move).

### `/agent-harry-notion-sync` slash command

Publishes confirmed Agent Harry artifacts to Notion as a structured workspace tree.

```bash
/agent-harry-notion-sync           # first run prompts for parent page
/agent-harry-notion-sync --dry-run # preview without writing
/agent-harry-notion-sync --re-init # reset .notion-config.json
```

The slash command requires Notion MCP to be connected. Builds this tree under your chosen parent page:

```
<Parent>/
└── <Project Name> — Agent Harry
    ├── 📍 Overview (auto-generated TOC)
    ├── 🔍 Discovery (research insights, competitive teardown)
    ├── 🎯 Define (positioning, prioritization, concepts, strategy)
    ├── 📊 Success Metrics (with ✓ Confirmed badge if Gate cleared)
    ├── 📄 PRDs (one page per generated PRD)
    └── 🚀 Deliver (design spec, usability test, launch plan)
```

Idempotent — re-run any time to push updates. MD files in `./design-workspace/` stay as the audit trail; Notion holds the decision-grade summary for your team. Token cost: ~$0.05–0.10 per sync.

## Slash Commands

| Command | Purpose |
|---|---|
| `/audit-pipeline` | Reports which phases have artifacts and whether the **Research-First Gate** + **Success-Metrics Gate** are PASS / BLOCK / OPTED-OUT. Run before any Deliver-phase work or whenever a session shifts toward "let's prototype / build / design". |
| `/agent-harry-notion-sync` | v3.5 push confirmed artifacts to Notion as a structured workspace. Idempotent; safe to re-run. `--dry-run` previews without writing. |
| `/agent-harry-audit` | v3.8 render the cross-session audit ledger (`.harry-audit.jsonl`) as a human-readable markdown timeline. Default: last 7 days, current project, all events. Flags: `--all`, `--days N`, `--agent <name>`, `--event <type>`, `--session <s_id>`. Read-only. |
| `/agent-harry-fingerprint` | v4.0 create or refresh the product fingerprint (project-level visual + composition vocabulary from 3–7 designer-picked Figma frames). |
| `/agent-harry-cost` | v4.1 measured cost report. Reads `token_usage` events from `.harry-audit.jsonl`, aggregates by model / agent / Claude Code session. Flags: `--all`, `--days N`, `--by-agent`, `--by-model`, `--json`. |

## Always-On Stop Gate

Every sub-agent run ends with a mandatory user checkpoint. The orchestrator (and any directly-invoked agent) presents the Executive Summary, then stops and waits for one of:

- `y` — proceed to the next planned step
- `revise <delta>` — iterate the same step with the revision delta
- `grill me` — invoke the `grill-me` skill to stress-test before locking in
- `cancel` — halt the pipeline

**This gate fires even when bypass-permissions mode is enabled.** Permission mode controls tool authorization; the Stop Gate is a product-design discipline. Silence is not consent — if no reply comes, the orchestrator re-asks rather than assuming approval.

## Executive Summary & Token Budget

Every agent handoff starts with a **stat-card table + Decision Data block + 3-bullet TL;DR + next-step line**. This is the human-readable summary. The long-form analysis below is for downstream AI handoff. You read the top; the next agent reads the bottom.

Hard output caps (per `SHARED_CONTEXT.md`):

| Section | Cap |
|---|---|
| Insights / synthesis | 6 |
| Gaps | 4 |
| Critique concerns | 4 |
| Scoring table rows | 10 |
| Open questions | 5 |

Orchestrator surfaces estimated token cost upfront and refuses any plan that exceeds $3 USD without explicit approval.

## Two Modes per Agent

Most agents now operate in two modes:

- **Mode A — Generate from scratch** (default when no existing artifacts provided)
- **Mode B — Audit / extend existing artifacts** (default when user provides files, links, or prior work)

The orchestrator routes to Mode B first when artifacts are present. Reasoning: don't pay twice for work already done. Existing artifacts get audited, critiqued, and extended before new work is commissioned.

Mode B coverage:

| Agent | Mode B input |
|---|---|
| `discovery-researcher` | Interview transcripts, surveys, GA4/Clarity, PDFs, Notion pages |
| `competitive-analyst` | Prior competitor research, market reports, analyst decks |
| `product-positioner` | Existing positioning docs, value props, pitch decks |
| `feature-prioritizer` | Existing roadmaps, backlogs, scoring tables |
| `ideation-facilitator` | Existing concept docs, brainstorm outputs |
| `lo-fi-designer` | Existing userflow Figjam, wireframes, lo-fi sketches, design system files (DS inventory mode) |
| `figma-designer` | Existing Figma file with hi-fi frames (audits flow coverage, state coverage, DS adherence, content realism) |
| `design-engineer` | Existing prototype code (`prototypes/` folder, Storybook, Figma-to-code output) |
| `usability-tester` | Existing test results, session recordings |
| `handoff-engineer` | Existing specs, design system docs |
| `critique-partner` | Already Mode B by design — operates on existing outputs |

## Required MCP Servers

- **Figma MCP** — read/write design files
- **Notion MCP** — research docs, specs, prioritization tables
- **Mobbin MCP** — UI pattern reference
- **Web Search** — competitive intel, framework lookups

## Installation

1. Copy `.claude/agents/` into your project root
2. Copy `SHARED_CONTEXT.md` into project root
3. Ensure required MCPs are connected in Claude Code
4. Start a session and invoke: *"Use the orchestrator agent to plan a discovery sprint for [feature]"*

## Usage Patterns

### Single-agent invocation
```
Use the competitive-analyst agent to map onboarding patterns
for fintech apps in Southeast Asia.
```

### Orchestrated workflow
```
Use the orchestrator to run a full define→deliver cycle for
the new merchant payout flow. Pause for my approval between phases.
```

### Critique pass
```
Have the critique-partner stress-test the prioritization rationale
from the last feature-prioritizer output.
```

## Decision Authority Model

Every agent operates under **per-agent approval gates**. Each agent declares its `DECISION_AUTHORITY` in frontmatter as one of:

- `autonomous` — Acts without approval (research, analysis, draft work)
- `propose` — Drafts → waits for explicit user approval before continuing
- `escalate` — Stops and asks user before making the call

The orchestrator respects these and inserts approval pauses accordingly.

## Anti-Patterns Enforced

Every agent's system prompt explicitly forbids:

1. **Generic AI advice** — No "it depends", "consider exploring", "various factors"
2. **Surface-level critique** — Every observation must include the *why* and a *what next*
3. **Buzzword salad** — No "leverage synergies", "holistic frameworks", "best-in-class"
4. **Premature solutions** — No jumping to fixes before the problem is named with evidence

If an agent catches itself drifting into these, it self-corrects in the next sentence.

## Methodology Stance

Agents are **framework-agnostic but context-aware**. They will draw from Double Diamond, JTBD, Lean UX, RICE, ICE, Kano, Atomic Design, etc. — but only when the context warrants it. They name the framework when they use one, and they justify the choice.

## File Map

```
product-designer-agents/
├── README.md                          ← you are here
├── SHARED_CONTEXT.md                  ← handoff schema + Token Budget + Research-First Gate + Decision Data spec
├── DECISION_DATA_SHAPES.md            ← v3.6 / v5.0 chat-render spec for the 4 decisionData shape variants
├── PM_SKILLS_MAP.md                   ← v3.6 per-agent skill ownership
├── SUBAGENT_AUDIT_PROTOCOL.md         ← v3.8 session identity + ledger append + slug derivation
├── .harry-audit.jsonl                 ← v3.8 append-only audit ledger (gitignored)
├── .gitignore                         ← v3.8 ignores audit ledger
└── .claude/
    ├── agents/
    │   ├── orchestrator.md          (opus)
    │   ├── critique-partner.md      (opus)
    │   ├── discovery-researcher.md  (sonnet)
    │   ├── competitive-analyst.md   (sonnet)
    │   ├── product-positioner.md    (sonnet)
    │   ├── feature-prioritizer.md   (sonnet)
    │   ├── ideation-facilitator.md  (sonnet)
    │   ├── lo-fi-designer.md       (sonnet) ← v3.7
    │   ├── figma-designer.md        (sonnet) ← v3.9
    │   ├── design-engineer.md       (sonnet) ← v3.7
    │   ├── usability-tester.md      (sonnet)
    │   ├── handoff-engineer.md      (sonnet)
    │   ├── pm-strategist.md         (sonnet)
    │   ├── pm-launch-architect.md   (sonnet)
    │   ├── pm-metrics-architect.md  (sonnet)
    │   ├── prd-author.md            (sonnet) ← v3.5
    │   ├── product-fingerprint-curator.md (sonnet) ← v4.0
    │   └── figma-component-bootstrapper.md (sonnet) ← v4.2
    └── commands/
        ├── audit-pipeline.md              ← /audit-pipeline
        ├── agent-harry-notion-sync.md     ← /agent-harry-notion-sync (v3.5)
        ├── agent-harry-audit.md           ← /agent-harry-audit (v3.8)
        ├── agent-harry-fingerprint.md     ← /agent-harry-fingerprint (v4.0)
        └── agent-harry-cost.md            ← /agent-harry-cost (v4.1)
```
