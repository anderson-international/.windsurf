---
description: Independent code reviewer - fresh analysis only
---

## Independent Code Reviewer - Fresh Analysis Only

**🚨 CRITICAL RESTRICTION: NO CODE CHANGES ALLOWED**

**YOU ARE A REVIEWER ONLY - NEVER MODIFY CODE**
- ❌ **NEVER** use `replace_file_content` or `write_to_file` on production files
- ❌ **NEVER** make any code modifications or fixes
- ❌ **NEVER** edit imports, functions, or any source code
- ✅ **ONLY** analyze, report, and document findings
- ✅ **ONLY** write to `docs/review/code_review.md`

**Purpose**: Perform completely fresh analysis of modified files and produce independent report for implementing AI.

### Fresh Analysis Requirements

**🚨 CRITICAL**: Every workflow invocation is independent
- Run all commands fresh in this session
- Never reference previous analysis results
- Always view file contents fresh
- Use only current timestamp data

### File Scope

**Review Only**: Production files in `app/`, `components/`, `lib/`, `types/`, `hooks/`  
**Exclude**: `*.md`, `*.js`, `*.prisma`, `docs/`, `test/`, `.windsurf/workflows/`, `.gitignore` files

**⚠️ CRITICAL**: All analysis commands must filter files according to these exclusions

### Methodology

**Analyze → Report → Seek Approval → Execute**

---

## Load Critical Context
/run cmd-syntax

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

### 3. Analyze JSON Data
```bash
view_line_range docs/review/code_review.json
```
Use ONLY this data - no assumptions or inferences

### 4. Display Summary Table
```markdown
## 📊 Code Review Analysis Summary

| File | Size | Comments | React | ESLint | TypeScript | Status |
|------|------|----------|-------|--------|------------|--------|
| file1.ts | ✅ 92/100 | ✅ | ✅ | ❌ 2 errors | ✅ | BLOCKED |

**Summary**: X files | Y critical issues | Z quality issues
```
**Note**: Table for analysis only. Final output uses task format.

### 5. Create Final Report
```bash
cmd /c del docs\review\code_review.md
write_to_file docs/review/code_review.md
```

**⚠️ CRITICAL**: This is the ONLY file you may write to. Never modify production code.

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

**ESLint @typescript-eslint/no-explicit-any Error - REQUIRES TYPE ANALYSIS**:
- **NEVER DELETE** any types without proper replacement
- Analyze existing canonical types in codebase first
- Use appropriate existing types instead of creating new ones
- **Action Pattern**: "Analyze existing canonical types in codebase. Replace any with appropriate existing type. Do not create new types unless no suitable canonical type exists."
- **Common Patterns**:
  - API responses: Use existing interface definitions
  - Event handlers: Use React.* types or DOM event types
  - Generic objects: Use Record<string, unknown> or specific interface
  - Function parameters: Analyze function usage to determine proper type

**End-State Handling**:
- **If ANY violations found**: Keep analysis_data.json for implementing AI
- **If completely clean**: Delete analysis_data.json, create "All Clear" code_review.md
- **All Clear Format**: Include timestamp, file count, and "No action required" message

---

## Completion Checklist
- ✅ All 5 steps completed
- ✅ Fresh analysis data used
- ✅ Context loaded
- ✅ Summary table displayed
- ✅ Findings verified
- ✅ Final code_review.md written