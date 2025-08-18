---
description: Essential context refresh for AI conversations
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

## FIRST: Understand your core tools

```bash
cmd /c node docs/scripts/docs-loader.js --help
```

```bash
cmd /c node docs/scripts/schema-query.js --help
```

```bash
cmd /c node docs/review/code-review.js --help
```

```bash
cmd /c node docs/scripts/code-fix.js --help
```

Note: `docs/scripts/code-fix.js` is a fallback utility. The orchestrator (`docs/review/code-review.js`) performs comment and console removals by default before analysis.

## SECOND: Run critical workflows
**Execute these - do not skip**
/run cmd-syntax
/run code-validation

## Load Core Constraints & Patterns
**Load context directly**

```bash
cmd /c node docs/scripts/docs-loader.js ai-critical
```

## Load Current Schema Index

```bash
cmd /c node docs/scripts/schema-query.js --index
```