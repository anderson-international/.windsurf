---
description: Essential context refresh for AI conversations
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

## FIRST: Understand your core tools
// turbo

```bash
cmd /c node docs/scripts/docs-loader.js --help
cmd /c node docs/scripts/schema-query.js --help
cmd /c node docs/scripts/code-review-analyzer.js --help
```

## SECOND: Run critical workflows
**Execute these - do not skip**
/run cmd-syntax
/run code-validation

## Load Core Constraints & Patterns
**Load context directly**
// turbo

```bash
cmd /c node docs/scripts/docs-loader.js ai-critical
```

## Load Current Schema Index
// turbo

```bash
cmd /c node docs/scripts/schema-query.js --index
```

## FINALLY: Analyze → Report → Seek Approval → Execute

**Core Principles:**
- **Analyze First**: Thoroughly investigate issues before proposing solutions
- **Report Findings**: Document all discoveries and provide clear explanations
- **Seek Explicit Approval**: Never proceed with fixes without user confirmation
- **Execute Systematically**: Apply fixes methodically, one at a time

EXCEPTION 