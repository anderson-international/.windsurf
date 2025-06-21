---
description: Load context for making informed workflow assignment decisions
---

# Workflow Assignment Context Loading

This workflow loads comprehensive context to make informed decisions about which workflows should include new documents.

## Context Loading Steps

// turbo
1. Load workflow assignment context
```bash
cmd /c node docs/scripts/docs-ingestion-engine.js docs-ai-context
```

// turbo  
2. Load form workflow context
```bash
cmd /c node docs/scripts/docs-ingestion-engine.js docs-forms
```

// turbo
3. Load API workflow context  
```bash
cmd /c node docs/scripts/docs-ingestion-engine.js docs-api
```

// turbo
4. Load UI workflow context
```bash
cmd /c node docs/scripts/docs-ingestion-engine.js docs-ui
```

// turbo
5. Load debug workflow context
```bash
cmd /c node docs/scripts/docs-ingestion-engine.js docs-debug
```

// turbo
6. Display document graph structure
```bash
cmd /c type docs\scripts\docs-graph.json
```

## Final Decision Steps

After loading all workflow contexts, the AI should automatically:

1. **Ask the user**: "Which document file do you want to add to the workflow system?"

2. **Read the specified file** and analyze its content

3. **Provide workflow recommendations**: Given the loaded context from all workflows, suggest which workflows should include the new document with clear reasoning

The AI will have full context about:
- Each workflow's purpose and current document assignments
- Existing patterns in workflow assignments  
- The content and structure of the document graph
- Representative documents from each workflow type

This enables informed recommendations with clear reasoning for workflow assignments.