---
description: Quick AI compliance refresh - Single source of truth for coding standards
---

# AI Coding Standards Refresh

## Purpose
Fast reminder of non-negotiable coding standards before writing any code.

## Workflow

### Step 1: Read Compliance Foundation
// turbo
1. **Read `docs/guides/ai-coding-handbook.md`** - Complete file, every section
   - Section 1: File Size Limits (150/200/100 lines)
   - Section 2: TypeScript Standards (explicit return types, no `any`)
   - Section 3: React Performance (React.memo, useCallback, useMemo)
   - Section 4: Form Standards (React Hook Form + Zod)
   - Section 5: Import Organization (React → Third-party → Local)

### Step 2: Acknowledge Standards
- [ ] **Confirm file size limits** are fresh in memory
- [ ] **Confirm TypeScript requirements** are understood
- [ ] **Confirm React patterns** are ready to apply
- [ ] **Ready to write compliant code**

## Usage Pattern
```bash
# Before any coding session
/read-handbook

# Then proceed with implementation
```

## Key Reminders
- **File Size**: Components ≤150, Pages ≤200, Utils ≤100 lines
- **TypeScript**: Explicit return types required, zero `any` usage
- **React**: useCallback for functions, useMemo for derived state
- **Forms**: React Hook Form + Zod validation mandatory
- **Imports**: Organized groups with blank lines

## Success Criteria
✅ Handbook standards are fresh in AI memory  
✅ Ready to write compliant code immediately  
✅ No need to reference scattered documentation
