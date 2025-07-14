---
description: Independent code reviewer - fresh analysis only
---

## Independent Code Reviewer - Fresh Analysis Only
You will not make any code changes. Your job is to perform a completely fresh analysis of files modified today and produce an independent report for the code-writing AI.

### 🚨 CRITICAL: WORKFLOW INTEGRITY

🔄 **WORKFLOW PURPOSE**: This review validates changes made by other AIs  
❌ **NEVER REFERENCE**: Previous analysis, cached data, conversation history  
✅ **ALWAYS FRESH**: Commands, file contents, metrics, findings

**EVERY WORKFLOW INVOCATION IS INDEPENDENT**
- This is a NEW analysis session
- IGNORE any previous analysis results from this conversation
- DO NOT reference cached command outputs
- DO NOT assume file states from earlier in conversation
- TREAT this as if you've never seen this codebase before

**⚠️ STALE DATA VIOLATIONS THAT BREAK THE WORKFLOW**:
- Referencing file sizes from earlier commands
- Assuming file contents without fresh view_file_outline
- Using TypeScript/ESLint results from previous runs
- Commenting on changes "since last review"

**✅ FRESH ANALYSIS CONFIRMED WHEN**:
- All commands run with current timestamp
- All file contents viewed fresh in this session
- No references to "previous" or "earlier" states
- Analysis reflects actual current codebase state

### File Type Exceptions
**MANDATORY EXCLUSIONS** - Do NOT review these file types:
- *.md files (documentation)
- *.js files (development scripts)
- docs/ directory (all files)
- test/ directory (all files)
- .windsurf/workflows (all files)
- Any file in .gitignore

**ONLY REVIEW PRODUCTION FILES**:
- app/ directory (Next.js routes)
- components/ directory (React components)
- lib/ directory (utilities and services)
- types/ directory (TypeScript definitions)
- hooks/ directory (React hooks)

### Ways of Working : Analyze → Report → Seek Approval → Execute

**Core Principles:**
- **Analyze First**: Thoroughly investigate issues before proposing solutions
- **Report Findings**: Document all discoveries and provide clear explanations
- **Seek Explicit Approval**: Never proceed with fixes without user confirmation
- **Execute Systematically**: Apply fixes methodically, one at a time

---

## Setup Phase

### Step 1: Load Critical Context
/run critical-context

### Step 2: Enumerate Touched Files
**AI ACTION REQUIRED**: Run the command FRESH and list all modified files

```bash
cmd /c git status --porcelain
```

**🚨 CRITICAL**: Use ONLY this fresh output. DO NOT reference any previous git status results from this conversation.

**MANDATORY OUTPUT FORMAT**:
```
Files to review (X files):
1. app/api/specifications/route.ts
2. components/wizard/hooks/useSpecification.ts
3. types/specification.ts
...
```

### Step 3: Load Additional Context
/run auto-context

### Step 4: Run Compilation & Lint Checks
**AI ACTION REQUIRED**: Run both commands FRESH and capture results

```bash
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0
```

**🚨 MANDATORY FRESH VERIFICATION**: 
- Exit code 0 = No errors
- Exit code ≠ 0 = Errors present
- ONLY report errors that appear in THIS FRESH command output
- DO NOT reference any previous TypeScript/ESLint results
- DO NOT assume or infer errors from code inspection alone
- ESLint command MUST target production directories only
- IGNORE any compilation results from earlier in this conversation

### Step 4.5: File-Specific Verification
**AI ACTION REQUIRED**: For each file with reported issues, run targeted verification

```bash
# Verify specific files mentioned in findings
cmd /c npx eslint [specific-file-path]
cmd /c npx tsc --noEmit [specific-file-path]
```

**MANDATORY**: Only report issues that appear in file-specific command output

### Step 4.6: Ultra-Minimalist Comment Analysis
**AI ACTION REQUIRED**: For each file, analyze ALL comments for policy violations

**COMMENT VIOLATION CATEGORIES**:

🚫 **ALWAYS VIOLATE** (must be removed):
- JSDoc comments that restate type/function names
- Comments stating obvious functionality
- Comments describing what code already self-documents
- Export convenience comments with no actual exports

⚠️ **BORDERLINE** (evaluate case-by-case):
- Comments explaining non-obvious usage patterns
- Comments clarifying data format expectations
- Comments explaining business logic rationale

✅ **ACCEPTABLE** (rare exceptions):
- Complex algorithm explanations
- Obscure technical implementation details
- Regulatory/compliance requirement explanations

---

## Analysis Phase

### Task 1: File-by-File Analysis
**MANDATORY**: For EACH modified file, apply ALL checklist items and report results using ✅❌➖ format.

**🚨 FRESH ANALYSIS REQUIREMENTS**:
- View each file's current contents with view_file_outline or view_line_range
- Calculate file sizes from CURRENT file state (not cached)
- Analyze comments from CURRENT file contents (not assumptions)
- Use ONLY fresh command outputs for TypeScript/ESLint findings

**For every file, you MUST evaluate:**
- [] Code file size limits (show actual lines vs limit)
- [] Ultra-minimalist comment policy (analyze each comment for violations)
- [] React loop prevention (check useCallback/useMemo usage)
- [] React anti-patterns (check for common issues)
- [] API error handling (verify error patterns)
- [] Database form patterns (check transaction usage)
- [] TypeScript compilation errors (ONLY from Step 4 actual output)
- [] ESLint warnings and errors (ONLY from Step 4 actual output)

### MANDATORY: Complete File Coverage
You MUST provide the checklist analysis for EVERY modified file. Use this exact format:

**File X: [filename]**
❌ **Code file size limits**: [actual] lines ([percentage]% over [limit]-line [type] limit)
❌ **Ultra-minimalist comment policy**: [violations found] OR ✅ No comment violations
➖ **React loop prevention**: N/A ([reason]) OR ✅/❌ [specific findings]
➖ **React anti-patterns**: N/A ([reason]) OR ✅/❌ [specific findings]
✅ **API error handling**: [specific findings] OR N/A ([reason])
✅ **Database form patterns**: [specific findings] OR N/A ([reason])
❌ **TypeScript compilation errors**: [quote exact errors from Step 4] OR ✅ No errors (exit code 0)
❌ **ESLint warnings and errors**: [quote exact issues from Step 4] OR ✅ No issues (exit code 0)

**CRITICAL**: Each checklist item must be on a separate line with proper markdown formatting

### Task 2: Priority Analysis
Batch findings by severity:
- **🔥 CRITICAL**: Build breaking issues (TypeScript errors, missing dependencies)
- **⚙️ HIGH**: Code quality violations (file size limits, React anti-patterns)
- **🔍 MEDIUM**: Style and maintenance issues (ESLint warnings, comments)

### Task 3: Create Code Review File
- Delete the `docs/review/code_review.md` if it exists
- Write a fresh, timestamped `docs/review/code_review.md` with structured findings including checkboxes for systematic tracking. Overwrite existing file for future reviews.

---

## Quality Gate
Your review is complete only when:
- ✅ Every modified file has full checklist analysis
- ✅ All ❌ items have specific fix instructions
- ✅ TypeScript/ESLint findings match Step 4 command output exactly
- ✅ No false positives from code inspection assumptions
- ✅ ONLY production files analyzed (excluded docs/, test/, *.js, *.md)
- ✅ File-specific verification completed for all reported issues
- ✅ Priority ordering is clear (Critical → High → Medium)
- ✅ code_review.md includes checkboxes for implementation tracking
- ✅ Validation commands are provided

---