---
description: Essential context refresh for AI conversations
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

## FIRST: Run critical workflows
**Execute these before any other steps:**
/run cmd-syntax
/run code-rules

## Load Core Constraints & Patterns
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