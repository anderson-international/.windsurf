---
description: Independent code fixes with strict approval gating
---

# Code Fix Workflow
 
**Objective**: Resolve all issues in `docs/review/output/code-review-results.json` in the mandated order.


## Phase 0 — Prepare & Load Context

- Intent: This workflow consumes the analyzer report and fixes every violation it lists.
- If the report is missing or stale, refresh it first:
  ```bash
  cmd /c node docs/review/code-review.js --porcelain
  ```
- Load the report:
  ```bash
  view_line_range docs/review/output/code-review-results.json
  ```
- Summarize violations by category and file. Wait for approval to proceed.

## Phase 1 — Plan & Approval Gate

- From `docs/review/output/code-review-results.json`, group targets by violation type: TypeScript (compiler + analyzer), ESLint, size budgets, duplicates (JSCPD), dead code (Knip), fallback data.
- Propose a safe execution order with validation steps for each category. Await explicit approval to proceed.

## Phase 2 — Safe Batch Fixes

### 2A. Autofix pass via Orchestrator (preferred)

- The orchestrator removes comments and console statements by default before analysis.
- Porcelain (changed files):
  ```bash
  cmd /c node docs/review/code-review.js --porcelain
  ```
- Targeted files:
  ```bash
  cmd /c node docs/review/code-review.js [files...]
  ```
- To disable autofix, pass `--no-autofix`

### 2B. Manual fallback: comments/console only (use sparingly)

- If orchestrator autofix fails or needs isolation, run manual fix then re-run analyzer:
  - Comments only:
    ```bash
    cmd /c node docs\scripts\code-fix.js --comments [files...]
    ```
  - Console (log/debug/info) only:
    ```bash
    cmd /c node docs\scripts\code-fix.js --console [files...]
    ```
  - Re-run analyzer to validate and produce a report:
    ```bash
    cmd /c node docs/review/code-review.js [files...]
    ```
 
### 2C. Re-run analysis to validate autofix

- Refresh the report and confirm comment/console violations are cleared:
  ```bash
  cmd /c node docs/review/code-review.js --porcelain --debug --report-all
  view_line_range docs/review/output/code-review-results.json
  ```

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

### 3E. Duplicates (JSCPD)

- Identify clone groups from the report; propose extraction/reuse; seek approval; apply; validate.

### 3F. Dead code (Knip)

- Propose safe deletes or deprecations; seek approval; apply; validate.

### 3G. Fallback data anti-patterns

- Replace fallback data patterns with typed alternatives consistent with codebase standards; seek approval; apply; validate.

## Phase 4 — Optional Safe Deletions

- If review flags legacy/stale files, delete them (Windows-safe):
  ```bash
  cmd /c node docs\scripts\code-fix.js --delete [paths...]
  ```

## Phase 5 — Final Validation & Completion

```bash
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0
cmd /c node docs/review/code-review.js --porcelain --debug --report-all
cmd /c git status --porcelain
```

Completion Checklist:
- ✅ Comments removed (Phase 2A)
- ✅ File sizes within budgets (Phase 3B)
- ✅ Return types aligned (Phase 3C)
- ✅ ESLint/any issues resolved (Phase 3D)
- ✅ Duplicates addressed (extraction/reuse) (Phase 3E)
- ✅ Dead code handled (Phase 3F)
- ✅ Fallback data patterns eliminated (Phase 3G)
- ✅ TypeScript + ESLint clean
- ✅ JSON report shows no remaining violations
- ✅ No new issues introduced

## Command Reference

| Purpose | Command |
|---------|----------|
| TypeScript check | `cmd /c npx tsc --noEmit --project tsconfig.json` |
| ESLint all | `cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0` |
| ESLint file(s) | `cmd /c npx eslint [files...] --max-warnings=0` |
| File sizes | `cmd /c node docs\scripts\code-size.js [files...]` |
| Analyzer (porcelain; autofix default on) | `cmd /c node docs/review/code-review.js --porcelain --debug --report-all` |
| Comments removal (fallback) | `cmd /c node docs\scripts\code-fix.js --comments [files...]` |
| Console removal (fallback) | `cmd /c node docs\scripts\code-fix.js --console [files...]` |
| Analyzer (autofix default on) | `cmd /c node docs/review/code-review.js [files...]` |
| Safe delete | `cmd /c node docs\scripts\code-fix.js --delete [paths...]` |
| Git status | `cmd /c git status --porcelain` |

**Critical Principle**: Every issue in the code review must be resolved. No exceptions, no shortcuts. Safety over speed.