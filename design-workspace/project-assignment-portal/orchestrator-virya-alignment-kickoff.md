---
session_id: s_20260630_0001
project_slug: project-assignment-portal
feature_slug: virya-ui-alignment
agent: orchestrator
phase: meta
mode: null
---

## Executive Summary

| Metric | Value |
|---|---|
| Agent | orchestrator |
| Phase | meta |
| Confidence | high |
| Inputs analyzed | SHARED_CONTEXT.md, virya-design-system.mdc, src/components/, src/styles/tokens.css |
| Key outputs | 1 alignment plan, 1 design-sync diff handoff |
| Recommendation | Run design-sync mirror on Sidebar + Button first |

**TL;DR:**
- Goal is **Virya component alignment** for the existing portal — not greenfield discovery.
- `design-sync` is **gate-exempt** (Figma already encodes decisions); best first Deliver move.
- Tokens are largely Virya-mapped; **components are bespoke** (4 wrappers vs ~30+ Virya library sets).
- Smallest next move: **`design-sync` mirror mode** on Updated Left Menu + Standard Button, starting with Sidebar.

---

## Diagnosis

| Area | Current state | Virya target |
|------|---------------|--------------|
| Colors / typography | `tokens.css` Core + System + `--tint-*` | Aligned (recent fixes applied) |
| Status badges | `StatusBadge` uses `--tint-*` | Semantic match; not Figma Badge instance |
| Buttons | `.mac-btn` CSS | Virya **Standard Button** component set |
| Navigation | `Sidebar.tsx` custom | Virya **Updated Left Menu** |
| Inputs | `.login-input`, `.team-form` | Virya **Textfield** |
| Tables | `.mac-table` | Virya **Cell** / table patterns |
| Icons | `src/icons/` hand-drawn SVGs | Virya **Icons** library |

## Alignment sequence (proposed)

1. **design-sync** `--mode diff` — baseline gap report (done → `diff-virya-ui-alignment.md`)
2. **design-sync** mirror — `Sidebar.tsx` ← Updated Left Menu (Figma reference frame)
3. **design-sync** mirror — extract `Button.tsx` ← Standard Button variants
4. **design-sync** mirror — `Textfield` for login + project forms
5. **handoff-engineer** — token + component contract doc for engineering

## Gates skipped (with rationale)

| Gate | Status | Why |
|------|--------|-----|
| Research-First | Bypassed for `design-sync` only | Orchestrator rule: mirror path is gate-exempt |
| Success-Metrics | Not required for `design-sync` | Same exemption |
| Product fingerprint | Missing | Not blocking `design-sync`; will soft-nudge before `design-engineer` |

## Figma sources

- Portal file: https://www.figma.com/design/yRnkdheAgapsGJN9SRsOHB/Project-Assign-Dashboard-Portal
- Components library: https://www.figma.com/design/CjCABootbKlUjl2pTpSguf/Components
- Style Guide: https://www.figma.com/design/xwWd70m6yIXVkDID7jgMMa/-Virya--Style-Guide

---

## Always-On Stop Gate

**Next move:** `design-sync` mirror mode — Sidebar / Updated Left Menu

Type one of:
- `y` — proceed with Sidebar mirror (build `## Code Bindings` bridge first)
- `revise — <delta>` — change priority (e.g. start with Button instead)
- `pivot — <new direction>` — switch approach (e.g. figma-designer hi-fi first)
- `grill me` — stress-test this plan via critique-partner
- `cancel` — halt pipeline
