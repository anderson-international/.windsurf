---
description: Independent code fixes with strict approval gating
---

# Code Fix Workflow
 
**Objective**: Resolve all issues in `docs/review/code_review.md` in the mandated order.

**Process**: Analyze → Report → Seek Approval → Execute → Validate

## Core Rules

- **All tasks mandatory**; no "critical vs quality" split.
- **Mandatory order**: Comments → Console.log/debug/info → Console.warn/error → File sizes → Types → ESLint/any
- **Batch safe ops**: Comments and console.log/debug/info may be batched with a single approval per category.
- **Risky ops (per-item approval)**: console.warn/error handling, file decomposition, TypeScript return/canonical types.
- **Fresh analysis** after each change; never rely on cached assumptions.
- **Post-change analyzer required**: After any modification in `app/`, `components/`, `lib/`, `types/`, `hooks/`, immediately run `docs\scripts\code-review-analyzer.js`.
- **File size budgets**:
  - components ≤ 150 lines
  - hooks ≤ 100 lines
  - utils ≤ 50 lines
  - types ≤ 100 lines
  - API routes ≤ 100 lines
- **No auto-run markers** in this workflow; approvals are explicit.

## Phase 0 — Prepare & Load Context

- Run the context workflow: `/run tech-code-quality`
- Load the review document:
  ```bash
  cmd /c type docs\review\code_review.md
  ```
- Summarize the findings. Wait for approval to proceed.

## Phase 1 — Plan & Approval Gate

- Produce a plan that groups target files by violation type (comments, console.log, console.warn/error, size, types, eslint/any).
- Propose execution order. Await explicit approval to proceed.

## Phase 2 — Safe Batch Fixes

### 2A. Remove Comments

- Command:
  ```bash
  cmd /c node docs\scripts\code-fix.js --comments [files...]
  ```

### 2B. Remove console.log/debug/info

- Command:
  ```bash
  cmd /c node docs\scripts\code-fix.js --console [files...]
  ```

Stop and request approval to enter Phase 3.

## Phase 3 — Risky Fixes (per-item approval)

### 3A. Handle console.warn/error (BLOCKING)

- For each occurrence:
  - Analyze context and follow codebase error patterns (typed errors/central helpers/API wrappers).
  - Propose change; await approval; apply.
  - Validate: analyzer, size, tsc, eslint.

### 3B. File Size Decomposition (respect budgets)

- Load guidance:
  ```bash
  cmd /c node docs\scripts\docs-loader.js code-size
  ```
- Propose decomposition plan based on existing patterns (modules, hooks, helpers).
- Apply one change at a time with approval and validate after each.

### 3C. TypeScript Return Types

- Research canonical types in `types/` and align implementations accordingly.
- Validate after each change.

### 3D. ESLint and any-typing

- Resolve remaining lint issues and eliminate `any` using canonical types or safe narrowing.
- Validate after each change.

## Phase 4 — Optional Safe Deletions

- If review flags legacy/stale files, delete them (Windows-safe):
  ```bash
  cmd /c node docs\scripts\code-fix.js --delete [paths...]
  ```

## Phase 5 — Final Validation & Completion

```bash
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0
cmd /c node docs\scripts\code-review-analyzer.js app/ components/ lib/ types/ hooks/
cmd /c git status --porcelain
```

Completion Checklist:
- ✅ Comments removed (Phase 2A)
- ✅ Console.log/debug/info removed (Phase 2B)
- ✅ Console.warn/error handled with approved changes (Phase 3A)
- ✅ File sizes within budgets (Phase 3B)
- ✅ Return types aligned (Phase 3C)
- ✅ ESLint/any issues resolved (Phase 3D)
- ✅ TypeScript + ESLint clean
- ✅ No new issues introduced

## Command Reference

| Purpose | Command |
|---------|----------|
| TypeScript check | `cmd /c npx tsc --noEmit --project tsconfig.json` |
| ESLint all | `cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0` |
| ESLint file(s) | `cmd /c npx eslint [files...] --max-warnings=0` |
| File sizes | `cmd /c node docs\scripts\code-size.js [files...]` |
| Comments removal | `cmd /c node docs\scripts\code-fix.js --comments [files...]` |
| Console removal (log/debug/info) | `cmd /c node docs\scripts\code-fix.js --console [files...]` |
| Analyzer | `cmd /c node docs\scripts\code-review-analyzer.js [files...]` |
| Safe delete | `cmd /c node docs\scripts\code-fix.js --delete [paths...]` |
| Git status | `cmd /c git status --porcelain` |

**Critical Principle**: Every issue in the code review must be resolved. No exceptions, no shortcuts. Safety over speed.