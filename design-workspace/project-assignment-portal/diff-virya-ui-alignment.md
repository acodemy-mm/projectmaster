---
session_id: s_20260630_0001
project_slug: project-assignment-portal
feature_slug: virya-ui-alignment
agent: design-sync
phase: deliver
mode: diff
figma_source_url: https://www.figma.com/design/yRnkdheAgapsGJN9SRsOHB/Project-Assign-Dashboard-Portal
bridge_status: missing
forward_gaps: 6
reverse_stale_count: 0
---

## Executive Summary

| Metric | Value |
|---|---|
| Agent | design-sync |
| Phase | deliver |
| Mode | diff |
| Confidence | medium |
| Inputs analyzed | Code scan (src/components, macos.css); Virya DS inventory from SHARED_CONTEXT + virya-design-system.mdc |
| Key outputs | 6 forward gaps, 0 reverse stale |
| Recommendation | Build component bridge, then mirror Sidebar + Button |

**TL;DR:**
- **Tokens:** code ↔ Virya Style Guide — **aligned** via `tokens.css`.
- **Components:** 6 high-priority Virya sets have **no code binding** yet.
- **Bridge:** `project-component-library.md` does not exist — required before mirror mode.
- Next: confirm bridge targets, then mirror **Updated Left Menu** → `Sidebar.tsx`.

---

## Forward gaps (Figma/Virya → code)

| Virya component | Code today | Gap kind | Priority |
|-----------------|------------|----------|----------|
| **Updated Left Menu** | `Sidebar.tsx` (custom) | unbound — structure + variants differ | P0 |
| **Standard Button** | `.mac-btn` CSS classes | unbound — no React component / variants | P0 |
| **Textfield** | `.login-input`, form `<input>` | unbound — no label/support-text pattern | P1 |
| **Status / Badge** | `StatusBadge` in `Badge.tsx` | partial — tints match, not Figma Badge props | P1 |
| **Cell / table row** | `.mac-table` | unbound — no Cell component | P2 |
| **Virya Icons** | `src/icons/index.tsx` | unbound — custom SVGs, not library instances | P2 |

## Reverse stale (code → Figma)

None flagged — code was built intentionally with Virya tokens; no orphan components detected that contradict the design system.

## Token audit

| Token layer | Status |
|-------------|--------|
| Core `--v-*` | Present in `tokens.css` |
| System `--tint-*` | Used in `Badge.tsx`, status UI |
| Typography `--text-*` | Used in `macos.css` |
| Elevation | `--elevation-*` mapped to `--mac-shadow-*` |
| Hardcoded hex in UI | Reduced — avatar palette + gantt use Virya values |

## Recommended bridge bindings (draft)

| Figma component | Code target | Scan root |
|-----------------|-------------|-----------|
| Updated Left Menu | `src/components/Sidebar.tsx` | `src/components/` |
| Standard Button | `src/components/Button.tsx` (to create) | `src/components/` |
| Textfield | `src/components/Textfield.tsx` (to create) | `src/components/` |
| Status | `src/components/Badge.tsx` → `StatusBadge` | `src/components/` |

---

## Always-On Stop Gate

**Next move:** Create `project-component-library.md` with `## Code Bindings`, then mirror Sidebar.

Type `y` to proceed, or `revise — <which component first>`.
