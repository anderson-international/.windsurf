---
description: Perform a lint review and iterate until clean
---

**CRITICAL***
User requires all terminal commands to use Windows command console (cmd) syntax with the cmd /c prefix. Do not use PowerShell commands. Always format commands as "cmd /c [command]" for compatibility with the Windows environment.

## Pre-Workflow: Load Lint Issue Guide

// turbo
**Load common lint fixes reference:**
```
Load: docs/guides/code-prevent-lint-issues.md
```

**Key Context Gained:**
- **Error frequency ranking** - Fix most common issues first (unused vars, hooks deps, Next.js Image)
- **Specific solutions** - Exact before/after code patterns for each error type
- **TypeScript patterns** - Interface definitions, return types, proper typing
- **React patterns** - Hook dependencies, component props, keys in lists

## Workflow

// turbo
1. Perform a lint review:
   - Run the linting tool over the entire codebase.
   - Identify and list all linting errors and warnings.

2. Analyze lint output with frequency priority:
   - **HIGH PRIORITY**: `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`
   - **MEDIUM PRIORITY**: `@typescript-eslint/no-explicit-any`, `@next/next/no-img-element`
   - **LOW PRIORITY**: `no-empty-pattern`, component props errors
   - Group similar errors for batch fixing

3. Plan fixes using documented patterns:
   - Reference prevent-lint-issues.md for specific solutions to each error type
   - Apply documented before/after patterns for common issues
   - Prioritize critical and frequently occurring issues first

4. Implement fixes systematically:
   - Start with highest frequency errors (unused variables, hook dependencies)
   - Use exact patterns from documentation (underscore prefix, dependency arrays)
   - Apply corrections to the codebase following documented solutions
   - Document changes made for each fix type

5. Re-run lint review:
   - After applying fixes, run the linting tool again.
   - Confirm that the number of linting errors and warnings has decreased.
   - Focus on remaining error types using documented solutions

6. Iterate until clean:
   - Repeat steps 1–5 until no linting errors or warnings remain.
   - Ensure the codebase achieves a clean lint status.
   - Reference documentation for any new or uncommon error patterns