---
description: Independent code reviewer — strict reviewer role; no fixes
---

## Code Review - Fresh Analysis Only

**Purpose**: Perform completely fresh analysis of modified files

### Fresh Analysis Requirements

**🚨 CRITICAL**: Every workflow invocation is independent
- // turbo
- Do not apply approval gates to this workflow. Complete all tasks with implicit approval
- Run all commands fresh in this session
- Never reference previous analysis results


### File Scope

**Review Only**: Production files in `app/`, `components/`, `lib/`, `types/`, `hooks/`  
**Exclude**: `*.md`, `*.js`, `*.prisma`, `docs/`, `test/`, `.windsurf/workflows/`, `.gitignore` files

**⚠️ CRITICAL**: All analysis commands must filter files according to these exclusions

---
##🚨 START: Run Critical Workflow
/run cmd-syntax


## 1. Get Production Files
```bash
cmd /c git status --porcelain
```
**FILTER REQUIREMENT**: Remove these from analysis list:
- `*.md`, `*.js`, `*.prisma` files
- Files in `docs/`, `test/`, `.windsurf/workflows/`
- `.gitignore` files

**Only analyze**: TypeScript files in `app/`, `components/`, `lib/`, `types/`, `hooks/`

## 2. Filter and Run Analysis Script
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
Use the table design including icons.
```markdown
## 📊 Code Review Analysis Summary

| File | Size | Comments | React | ESLint | TypeScript | Fallbacks | Status |
|------|------|----------|-------|--------|------------|-----------|--------|
| file1.ts | ✅ 92/100 | ✅ | ✅ | ❌ 2 errors | ✅ | ❌ 1 | BLOCKED |

Summary: X files | Y missing return types | Z fallback violations | C comment violations
```