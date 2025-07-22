---
description: Essential context refresh for AI conversations
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

## Windows command syntax
/run cmd-syntax

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

## Ways of Working

### Methodology: Analyze → Report → Seek Approval → Execute

**Core Principles:**
- **Analyze First**: Thoroughly investigate issues before proposing solutions
- **Report Findings**: Document all discoveries and provide clear explanations
- **Seek Explicit Approval**: Never proceed with fixes without user confirmation
- **Execute Systematically**: Apply fixes methodically, one at a time

## AI Instructions

You now have the essential constraints, ways of working and current schema information loaded:

- **Code file size limits** (Components: 150 lines, Hooks: 100 lines, Utils: 50 lines, Types: 100 lines)
- **React loop prevention patterns** (useCallback, useMemo, dependency arrays)
- **Schema loading commands** (with correct Windows syntax)
- **Context request instructions** (how to ask for additional context)

**Important**: If you need additional context for your specific task, explicitly request it using: "I need context for [forms/API/React patterns/database/etc]"

This workflow ensures you have the fundamental constraints needed for any coding task while encouraging you to request task-specific context as needed.