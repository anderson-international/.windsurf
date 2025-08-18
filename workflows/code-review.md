---
description: Independent code reviewer — no manual fixes; normalization (comments/console cleanup) allowed
auto_execution_mode: 1
---

## Code Review - Fresh Analysis Only

**Purpose**: Perform completely fresh analysis of modified files

### Fresh Analysis Requirements

**🚨 CRITICAL**: Every workflow invocation is independent
- // turbo-all
- Do not apply approval gates to this workflow. Complete all tasks with implicit approval
- This workflow has implicit approval to perform orchestrator normalization (comments/console cleanup). Do NOT pass `--no-autofix` unless explicitly instructed.
- Run all commands fresh in this session
- Never reference previous analysis results

---
##🚨 START: Run Critical Workflow
/run cmd-syntax


## 1. Run Fresh Analysis (Porcelain default)

- Orchestrator auto-filters changed TS/TSX files touched by recent activity and removes comments/console by default.
- Recommended run (default):
  ```bash
  cmd /c node docs/review/code-review.js --porcelain
  ```
- Scope is automatically enforced (TS/TSX in `app/`, `components/`, `lib/`, `types/`, `hooks/`; non-code paths excluded). No manual filtering needed.
- Do not prompt for options; run the porcelain command above by default.
- Autofix is ON by default for this workflow; do not disable it unless explicitly instructed.
- Optional flags (fallbacks, use only if explicitly needed):
  - Read-only run (no autofix): add `--no-autofix`.
  - Timing/instrumentation: add `--debug`.
  - Note: The tool prints an "AI ACTION REQUIRED" line and writes the report to `docs/review/output/code-review-results.json`.
  - If the report file is missing (e.g., zero violations), re-run with `--report-all` to generate an explicit report file.

## 2. Manual override (rare)
- If porcelain is unavailable, specify explicit files (orchestrator still applies internal TS/TSX + prod-dir filters):
  ```bash
  cmd /c node docs/review/code-review.js [files...]
  ```

## 3. Load Report
```bash
view_line_range docs/review/output/code-review-results.json
```
Use ONLY this data - no assumptions or inferences
 - If the report file is missing (e.g., zero violations), re-run Step 1 with `--report-all` to generate an explicit report file, then load it again.

## 4. Display Summary Table
Use the table design including icons.
```markdown
## 📊 Code Review Analysis Summary

| File | Size | Comments | React | ESLint | TypeScript | Fallbacks | Status |
|------|------|----------|-------|--------|------------|-----------|--------|
| file1.ts | ✅ 92/100 | ✅ | ✅ | ❌ 2 errors | ✅ | ❌ 1 | BLOCKED |

Summary: X files | Y missing return types | Z fallback violations | C comment violations
```

## 5. Actionable Instructions (no fixes here)

- Produce prioritized, concrete next steps per file, referencing the report:
  - TypeScript: list error counts/messages; propose targeted fixes (types, returns, narrowing).
  - ESLint: list rule ids and locations; propose precise corrections.
  - Size budgets: propose decompositions (modules, hooks, helpers) with file splits.
  - Duplicates (JSCPD): identify clone groups; suggest extraction or reuse targets.
  - Dead code (Knip): propose safe deletes or deprecations.
- Do NOT change code in this workflow. Provide a clear action plan.
- When ready to fix, hand over to the code-fix workflow and/or re-run the orchestrator on targeted files to validate:
  ```bash
  cmd /c node docs/review/code-review.js [files...]
  ```