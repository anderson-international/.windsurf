---
description: Independent code reviewer — strict reviewer role; no fixes
---

## Independent Code Reviewer - Fresh Analysis Only

**🚨 CRITICAL RESTRICTION: NO CODE CHANGES ALLOWED**

**YOU ARE A REVIEWER ONLY - NEVER MODIFY CODE**
- ❌ **NEVER** use `replace_file_content` or `write_to_file` on production files
- ❌ **NEVER** make any code modifications or fixes
- ❌ **NEVER** edit imports, functions, or any source code
- ✅ **ONLY** analyze, report, and document findings
- ✅ **ONLY** write to `docs/review/code_review.md`
 - ❌ **NEVER** edit `.windsurf/workflows/*` or `docs/scripts/*` as part of review. Reviewer writes report only.

**Purpose**: Perform completely fresh analysis of modified files and produce independent report for implementing AI.

### Dual-Agent Model (Explicit Roles)

- **Reviewer (this workflow)**
  - Analyze fresh changes (no fixes)
  - Display summary table in chat
  - Write final report to `docs/review/code_review.md` only
  - Never modify production code
- **Fixer (`@[/code-fix]` workflow)**
  - Implements fixes in the specified order
  - Seeks explicit approval per Analyze → Report → Seek Approval → Execute
  - Re-runs analyzer and validates results

### Fresh Analysis Requirements

**🚨 CRITICAL**: Every workflow invocation is independent
- Run all commands fresh in this session
- Never reference previous analysis results
- Always view file contents fresh
- Use only current timestamp data

**⚠️ CRITICAL**: Never modify production code.

### File Scope

**Review Only**: Production files in `app/`, `components/`, `lib/`, `types/`, `hooks/`  
**Exclude**: `*.md`, `*.js`, `*.prisma`, `docs/`, `test/`, `.windsurf/workflows/`, `.gitignore` files

**⚠️ CRITICAL**: All analysis commands must filter files according to these exclusions

---
##🚨 START: Run Critical Workflow
/run cmd-syntax

### 0. Role Confirmation (Reviewer-only)
- Confirm in chat: “I am Reviewer-only and will not modify production code.”
- If the user requests fixes: Instruct to switch to `@[/code-fix]`.

## 5-Step Review Process

### 1. Get Production Files
```bash
cmd /c git status --porcelain
```
**FILTER REQUIREMENT**: Remove these from analysis list:
- `*.md`, `*.js`, `*.prisma` files
- Files in `docs/`, `test/`, `.windsurf/workflows/`
- `.gitignore` files

**Only analyze**: TypeScript files in `app/`, `components/`, `lib/`, `types/`, `hooks/`

### 2. Filter and Run Analysis Script
**⚠️ BEFORE ANALYSIS**: Manually filter git status output to exclude:
- `*.md`, `*.js`, `*.prisma` files  
- Files in `docs/`, `test/`, `.windsurf/workflows/`

```bash
cmd /c node docs/scripts/code-review-analyzer.js [filtered-typescript-files-only]
```

**Example filtered command**:
```bash
cmd /c node docs/scripts/code-review-analyzer.js app/api/auth/route.ts components/wizard/WizardForm.tsx lib/services/user-service.ts
```

### Edge Cases
- If no changed TS/TSX files after filtering: Write an “All Clear” report with timestamp and file count; do not run the analyzer.
- If the analyzer exits with an error: Report the stderr in chat and write a minimal report; do not infer results.
- If files appear in git status but are absent in the JSON: Note them explicitly in chat and in the report; do not assume PASS/FAIL without JSON.

### 3. Analyze JSON Data
```bash
view_line_range docs/review/code_review.json
```
Use ONLY this data - no assumptions or inferences

### 4. Display Summary Table
Use the table design including icons.
```markdown
## 📊 Code Review Analysis Summary

| File | Size | Comments | React | ESLint | TypeScript | Fallbacks | Status |
|------|------|----------|-------|--------|------------|-----------|--------|
| file1.ts | ✅ 92/100 | ✅ | ✅ | ❌ 2 errors | ✅ | ❌ 1 | BLOCKED |

Summary: X files | Y missing return types | Z fallback violations | C comment violations
```

### 5. Create Final Report
Do not seek approval. Write the report and finish the task
```bash
cmd /c del docs\review\code_review.md
write_to_file docs/review/code_review.md
```

**Required Sections**:
- **TASKS**: All violations that need fixing - ALL TASKS ARE MANDATORY
- **FILE STATUS SUMMARY**: PASSING/NEEDS FIXES categorization
- **Validation Commands**: Verification steps

**🚨 CRITICAL TASK ORDERING**: 
1. **Comments MUST be removed first** (affects file size calculations)
2. **File size violations** (after comment removal)
3. **All other violations** (ESLint errors, missing return types, etc.)

**Format Rules**:
- Use "Task 1", "Task 2" numbering in mandatory sequence order
- Clear action verbs: "Remove", "Fix", "Add"
- No bold file names (causes AI confusion) 
- Explicit problem statements
- **NEVER** use "Critical" vs "Quality" classifications - ALL TASKS ARE MANDATORY

**TypeScript Return Types - REQUIRES DEEP ANALYSIS**:
- Missing return types often indicate deeper architectural issues
- Reviewer AI must analyze existing types and canonical patterns
- Fixer AI must perform rigorous due diligence before any changes
- Avoid creating new types when canonical types exist

**ESLint no-useless-catch Error - REQUIRES ERROR COMPOSITION**:
- **NEVER DELETE** catch blocks flagged by no-useless-catch
- Original code is likely correct but needs proper error composition
- Apply context-appropriate error patterns:
  - **Services**: `throw new Error(`Service operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)`
  - **API Routes**: `return handleApiError(error)` or create structured error response with context
  - **Utilities**: Re-throw with enhanced context: `throw new Error(`Operation context: ${error instanceof Error ? error.message : String(error)}`)`
  - **Critical Operations**: Add logging: `console.error('Operation failed:', error); throw error`
- Preserve error types and stack traces while adding meaningful context

**ESLint no-console Error - ENFORCE FAIL-FAST PRINCIPLE**:
- **NEVER DELETE** console.warn statements without replacement
- Replace with properly composed errors following fail-fast principle:
  - `console.warn('Product lookup failed, continuing without product data:', error)` 
  - **→ BECOMES:** `throw new Error(`Product lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)`
- **Rationale**: Warnings mask data integrity violations and cause downstream crashes
- **Pattern**: Replace silent failures with explicit error throwing
- **Exception**: Keep `console.error()` for actual logging before throwing errors

**End-State Handling**:
- **If ANY violations found**: Keep analysis_data.json for implementing AI
- **If completely clean**: Delete analysis_data.json, create "All Clear" code_review.md
- **Explicit retention rule**: If violations exist, do NOT delete `docs/review/code_review.json`. Only delete it on a completely clean run.

**Handoff to Fixer (Do Not Fix Here)**
- Provide final report path: `docs/review/code_review.md`
- Ensure `docs/review/code_review.json` is present when violations exist
- Mandatory task order for Fixer:
  1. Bulk remove comments
  2. Bulk remove console statement
  3. Re-check file sizes
  4. Add missing return types
  5. Replace fallback data with composed errors
- Reference commands for Fixer:
  - Re-run analyzer on the same filtered list
  - Perform focused checks for comments, return types, and fallbacks

---

## Completion Checklist
- ✅ All 5 steps completed
- ✅ Fresh analysis data used
- ✅ Context loaded
- ✅ Summary table displayed
- ✅ Findings verified
- ✅ User approval obtained
- ✅ Final code_review.md written