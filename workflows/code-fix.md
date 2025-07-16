---
description: Implement independent code review
---

# Code Fix Workflow

**Analyze → Report → Seek Approval → Execute**

## Rules

- **Fresh analysis only**: No cached data, previous results, or conversation history
- **One fix at a time**: Individual approval and verification required
- **Batch efficiency**: Multiple files in single commands
- **TypeScript return types**: Mandatory deep analysis (see below)

## 1. Load Review

```bash
cmd /c type docs\review\code_review.md
```

## 2. Validate Issues

```bash
# Verify issues still exist
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0

# Check file sizes (batch all files)
# // turbo
cmd /c node docs\scripts\count-lines.js [file1] [file2] [file3] ...

# Check comment violations (batch all files)
# // turbo
cmd /c node docs\scripts\count-lines.js --comments [file1] [file2] [file3] ...
```

**Only proceed with issues confirmed in fresh output**

## 3. Analyze Issues

**For each confirmed issue**:
1. `view_file_outline` and `view_line_range` for fresh analysis
2. Determine fix complexity and risk
3. **TypeScript return types**: Perform mandatory deep analysis (see below)

**Analysis Format**:
```
**Issue: [filename]**
❌ **Problem**: [specific issue from fresh analysis]
🔧 **Fix**: [exactly what will be changed]
⚠️ **Risk**: [Safe/Risky]
✅ **Verification**: [how to confirm success]
```

**Fix Classification**:
- **Safe**: Remove unused imports, console.logs, obvious comments
- **Risky**: Logic changes, function signatures, state management
- **Deep Analysis**: TypeScript return types

### 🚨 TypeScript Return Type Analysis

**Mandatory process for missing return types**:

1. **Search existing types**:
   ```bash
   grep_search components/ hooks/ types/ "interface.*Return"
   grep_search components/ hooks/ types/ "type.*Return"
   ```

2. **Analyze function context**:
   ```bash
   view_file_outline [target-file]
   view_line_range [target-file] [function-lines]
   view_line_range [target-file] 1 20  # Check imports
   ```

3. **Find similar patterns**:
   ```bash
   grep_search components/ hooks/ "function.*similar-pattern"
   ```

**Required approval format**:
```
**TypeScript Return Type Fix: [filename]**

**Function Analysis**:
- Function: [function-name]
- Current signature: [current-signature]
- Return value: [what-it-returns]

**Existing Types Research**:
- Canonical types found: [list-existing-types]
- Import analysis: [existing-imports]
- Pattern consistency: [matches-similar-functions]

**Proposed Fix**:
- Return type: [specific-type]
- Rationale: [why-this-type]
- Import needed: [import-statement-if-needed]

**Risk**: [Safe/Risky with justification]

Approve? [Yes/No]
```

**Forbidden**: `: any`, `: unknown`, creating new types without research

## 4. Request Approval

**Standard fix request**:
```
**Fix Request: [filename]**
Issue: [specific problem]
Proposed fix: [exact changes]
Risk: [Safe/Risky]

Approve this fix? [Yes/No]
```

**TypeScript return types**: Use format from section 3 above

## 5. Apply Fix

**After approval**:
1. Apply fix using edit tool
2. Verify TypeScript: `cmd /c npx tsc --noEmit --project tsconfig.json`
3. Verify ESLint: `cmd /c npx eslint [filepath] --max-warnings=0`
4. **STOP** - Wait for next approval

## 6. Final Validation

```bash
# Comprehensive validation
cmd /c npx tsc --noEmit --project tsconfig.json
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0
cmd /c git status --porcelain
```

## 7. Update Documentation

Check off completed items in `docs/review/code_review.md`

## Commands Reference

```bash
# TypeScript compilation
cmd /c npx tsc --noEmit --project tsconfig.json

# ESLint (all production)
cmd /c npx eslint app/ components/ lib/ types/ hooks/ --max-warnings=0

# ESLint (specific file)
cmd /c npx eslint [filepath] --max-warnings=0

# File size limits (batch multiple files)
cmd /c node docs\scripts\count-lines.js [file1] [file2] [file3] ...

# Comment violations (batch multiple files)
cmd /c node docs\scripts\count-lines.js --comments [file1] [file2] [file3] ...

# Git status
cmd /c git status --porcelain
```

## Completion Requirements

- ✅ All issues analyzed fresh
- ✅ Each fix individually approved and verified
- ✅ TypeScript compilation passes
- ✅ ESLint passes
- ✅ File sizes within limits
- ✅ Code review updated
- ✅ No new issues introduced

**Safety over speed. One perfect fix beats multiple broken attempts.**