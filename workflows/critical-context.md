---
description: Essential context refresh for AI conversations
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus current schema information.

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

## AI Instructions

You now have the essential constraints and current schema information loaded:

- **Code file size limits** (Components: 150 lines, Hooks: 100 lines, Utils: 50 lines, Types: 100 lines)
- **React loop prevention patterns** (useCallback, useMemo, dependency arrays)
- **Schema loading commands** (with correct Windows syntax)
- **Context request instructions** (how to ask for additional context)

**Important**: If you need additional context for your specific task, explicitly request it using: "I need context for [forms/API/React patterns/database/etc]"

This workflow ensures you have the fundamental constraints needed for any coding task while encouraging you to request task-specific context as needed.
