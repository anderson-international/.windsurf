---
description: Mandatory code quality for all file operations
auto_execution_mode: 1
---

# Code Quality Validation

## FIRST: Understand your core validation tools
Run the following commands to understand the options available for your code review and code fix tools
// turbo

```bash
cmd /c node docs/review/code-review.js --help
cmd /c node docs/scripts/code-fix.js --help
```

Note: `docs/scripts/code-fix.js` is a fallback utility. The orchestrator (`docs/review/code-review.js`) performs comment and console removals by default before analysis.

## File Scope
### Automatic 
Limit the scope of the reviewed files to TypeScript files changed since the last git sync via
```bash
cmd /c node docs/review/code-review.js --porcelain 
```
### Manual
```bash
cmd /c node docs/review/code-review.js <file1> [file2 ...]
```

## Recommended Options

- Concurrency (default 4):
  ```bash
  cmd /c node docs/review/code-review.js --porcelain --concurrency 4
  ```
- Debug + timing instrumentation:
  ```bash
  cmd /c node docs/review/code-review.js --porcelain --debug
  ```
- Disable autofix (if needed):
  ```bash
  cmd /c node docs/review/code-review.js --porcelain --no-autofix
  ```

- Repo-wide analyzers:
  - JSCPD include roots and token size:
    ```bash
    cmd /c node docs/review/code-review.js --porcelain --jscpd-include . --jscpd-min-tokens 60
    ```
  - TypeScript config or skip TSC:
    ```bash
    cmd /c node docs/review/code-review.js --porcelain --tsconfig path\to\tsconfig.json
    cmd /c node docs/review/code-review.js --porcelain --skip-tsc
    ```

## Enforcement
- **Zero tolerance** for skipping validation
- **BLOCKING**: Script failures must be fixed before proceeding
- **No workarounds** - address violations, don't ignore them
- **Stop all work** until analyzer reports clean results

## Why No Exceptions?
- Ensures consistent code quality standards
- Prevents accumulation of technical debt
- Catches issues early before they compound
- Maintains project quality baseline