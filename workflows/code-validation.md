---
description: Mandatory code quality for all file operations
---

# Code Quality Validation

## FIRST : Methodology: Analyze → Report → Seek Approval → Execute

**Core Principles:**
- **Analyze First**: Thoroughly investigate issues before proposing solutions
- **Report Findings**: Document all discoveries and provide clear explanations
- **Seek Explicit Approval**: Never proceed with fixes without user confirmation
- **Execute Systematically**: Apply fixes methodically, one at a time

## MANDATORY: Run After Every File Operation

### When to Run
- ✅ **After creating ANY new file**
- ✅ **After editing ANY existing file** 
- ✅ **No exceptions** - all changes must be validated

### Command to Execute
```bash
node docs/scripts/code-review-analyzer.js [file-1] [file-2]
```

### File Scope

**Review Only**: Production files in `app/`, `components/`, `lib/`, `types/`, `hooks/`  
**Exclude**: `*.md`, `*.js`, `*.prisma`, `docs/`, `test/`, `.windsurf/workflows/`, `.gitignore` files

### Rules
1. **New Files**: Immediately run analyzer on created file
2. **File Edits**: Immediately run analyzer on modified file  
3. **Fix Issues Immediately**: Address any violations before proceeding

### Enforcement
- **Zero tolerance** for skipping validation
- **BLOCKING**: Script failures must be fixed before proceeding
- **No workarounds** - address violations, don't ignore them
- **Stop all work** until analyzer reports clean results

### Why No Exceptions?
- Ensures consistent code quality standards
- Prevents accumulation of technical debt
- Catches issues early before they compound
- Maintains project quality baseline