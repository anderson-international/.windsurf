---
description: Implement independent code review
---

# Code Fix Workflow

**Objective**: Fix ALL issues in `docs/review/code_review.md` in mandatory sequence

**Process**: Analyze → Approve → Execute → Validate

## Core Rules

- **All tasks mandatory**: No "critical" vs "quality" - fix everything
- **Mandatory sequence**: Comments → File sizes → Other fixes  
- **Batch comments**: Single approval for all deletions (safe operation)
- **Individual fixes**: Separate approval for logic-affecting changes
- **Fresh analysis**: No cached data - verify issues before fixing



## 1. Setup & Validation

##🚨 START: Run Critical Workflows
/run cmd-syntax
/run critical-context

### Load Review Document
```bash
cmd /c type docs\review\code_review.md
```

### Run Code Quality Workflow
/run tech-code-quality

### Validate Current Issues
```bash
# Verify compilation and linting issues
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0

# Batch validate file sizes and comments
# // turbo
cmd /c node docs\scripts\code-size.js [file1] [file2] [file3] ...
cmd /c node docs\scripts\code-size.js --comments [file1] [file2] [file3] ...
```

**Only proceed with confirmed issues from fresh validation**

## 2. Fix Process (Mandatory Sequence)

### Step 1: Batch Comment Removal

**Analysis**: List all files with comments, count total violations

**Approval Request**:
```
**Batch Comment Deletion**
Files: [file1] ([n] comments), [file2] ([n] comments)...
Total: [n] comments | Risk: Safe | Verification: Size re-analysis
Approve? [Yes/No]
```

**Apply Fix**: Remove ALL comments, then re-run size analysis:
```bash
# // turbo  
cmd /c node docs\scripts\code-size.js [previously-commented-files]
```

### Step 2: File Size Violations

**Analysis Process**:
1. Load decomposition guidance: `cmd /c node docs\scripts\docs-loader.js code-size`
2. Research existing patterns in codebase
3. Plan logical file separation

**Approval Request**:
```
**File Size Decomposition: [filename]**
Current: [lines]/[limit] | Over by: [%]
Plan: Split into [new-files] using [separation-logic]
Pattern: [existing-similar-decompositions]
Approve? [Yes/No]
```

**Apply**: Decompose file, update imports

### Step 3: TypeScript Return Types

**Analysis Process**:
1. Search existing types: `grep_search types/ "interface.*Return"`
2. Analyze function context: `view_file_outline [file]`
3. Find similar patterns: `grep_search hooks/ "function.*[pattern]"`

**Approval Request**:
```
**TypeScript Fix: [filename]**
Function: [name] | Current: [signature] | Proposed: [return-type]
Research: [existing-types] | Pattern: [similar-functions]
Risk: [Safe/Risky] | Import: [if-needed]
Approve? [Yes/No]
```

### Step 4: ESLint & Other Issues

**Standard Fix Request**:
```
**Fix: [filename]**
Issue: [specific-problem]
Solution: [exact-changes]
Risk: [Safe/Risky]
Approve? [Yes/No]
```

## 3. Apply Fix Protocol

**After Each Approval**:
1. Apply approved changes
2. Verify: `cmd /c npx tsc --noEmit --project tsconfig.json`
3. Verify: `cmd /c npx eslint [filepath] --max-warnings=0` 
4. **STOP** - Request next approval

**Exception - Batch Comments**:
1. Apply all comment deletions
2. Re-analyze file sizes
3. Verify TypeScript compilation
4. Proceed to size violations

## 4. Risk Classifications

- **Safe**: Remove comments, unused imports, console.logs
- **Risky**: Logic changes, function signatures, state management  
- **Deep Analysis Required**: TypeScript return types, file decomposition

**Forbidden Actions**:
- Using `: any` or `: unknown` types
- Arbitrary file splitting without pattern research
- Cascade fixes across multiple files
- Logic changes without explicit approval

## 5. Completion Validation

### Pre-Final Check
```bash
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0
cmd /c git status --porcelain
```

### Completion Checklist
- ✅ All comment violations removed (Task 1)
- ✅ File size re-analysis completed (After Task 1)
- ✅ All size violations resolved (Task 2)
- ✅ All TypeScript errors fixed (Task 3)
- ✅ All ESLint errors resolved (Task 4)
- ✅ All other issues addressed (Task 5)
- ✅ TypeScript compilation passes
- ✅ ESLint passes with no warnings
- ✅ No new issues introduced

## Command Reference

| Purpose | Command |
|---------|----------|
| TypeScript check | `cmd /c npx tsc --noEmit --project tsconfig.json` |
| ESLint all | `cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0` |
| ESLint file | `cmd /c npx eslint [filepath] --max-warnings=0` |
| File sizes | `cmd /c node docs\scripts\code-size.js [files...]` |
| Comments | `cmd /c node docs\scripts\code-size.js --comments [files...]` |
| Git status | `cmd /c git status --porcelain` |

**Critical Principle**: Every issue in the code review must be resolved. No exceptions, no shortcuts. Safety over speed.