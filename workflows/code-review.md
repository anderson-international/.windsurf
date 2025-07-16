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
**Exclude**: `*.md`, `*.js`, `docs/`, `test/`, `.windsurf/workflows/`, `.gitignore` files

### Methodology

**Analyze → Report → Seek Approval → Execute**

---

## 6-Step Review Process

### 1. Get Production Files
```bash
cmd /c git status --porcelain
```
List only production files (exclude docs, tests, .md files)

### 2. Run Analysis Script
```bash
cmd /c node docs/scripts/code-review-analyzer.js [file1] [file2] ...
```

### 3. Load Context
Run `@[/critical-context]` plus file-type specific context:
- `components/wizard/` → `@[/tech-react-forms]`
- `hooks/` → `@[/tech-react-fundamentals]`
- `types/` → `@[/tech-typescript-patterns]`
- `lib/validators/` → `@[/tech-code-validation]`
- `app/api/` → `@[/tech-api-patterns]`

### 4. Analyze JSON Data
```bash
view_line_range docs/review/analysis_data.json
```
Use ONLY this data - no assumptions or inferences

### 5. Display Summary Table
```markdown
## 📊 Code Review Analysis Summary

| File | Size | Comments | React | ESLint | TypeScript | Status |
|------|------|----------|-------|--------|------------|--------|
| file1.ts | ✅ 92/100 | ✅ | ✅ | ❌ 2 errors | ✅ | BLOCKED |

**Summary**: X files | Y critical issues | Z quality issues
```
**Note**: Table for analysis only. Final output uses task format.

### 6. Create Final Report
```bash
cmd /c del docs\review\code_review.md
write_to_file docs/review/code_review.md
```

**⚠️ CRITICAL**: This is the ONLY file you may write to. Never modify production code.

**Required Sections**:
- **TASKS**: All violations that need fixing (ESLint errors, comment violations, missing return types, etc.)
- **FILE STATUS SUMMARY**: PASSING/NEEDS FIXES categorization
- **Validation Commands**: Verification steps

**Format Rules**:
- Use "Task 1", "Task 2" numbering
- Clear action verbs: "Change to", "Add", "Remove"
- No bold file names (causes AI confusion)
- Explicit problem statements

**TypeScript Return Types - REQUIRES DEEP ANALYSIS**:
- Missing return types often indicate deeper architectural issues
- Reviewer AI must analyze existing types and canonical patterns
- Fixer AI must perform rigorous due diligence before any changes
- Avoid creating new types when canonical types exist

**End-State Handling**:
- **If ANY violations found**: Keep analysis_data.json for implementing AI
- **If completely clean**: Delete analysis_data.json, create "All Clear" code_review.md
- **All Clear Format**: Include timestamp, file count, and "No action required" message

---

## Completion Checklist
- ✅ All 6 steps completed
- ✅ Fresh analysis data used
- ✅ Context loaded
- ✅ Summary table displayed
- ✅ Findings verified
- ✅ User approval obtained
- ✅ Final code_review.md written
