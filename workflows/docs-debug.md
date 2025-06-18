---
description: Load debugging and troubleshooting documentation
---

# Debugging & Troubleshooting Context

## When to Use
When fixing bugs, performance issues, or linting errors.

## Load Sequence

// turbo
1. Load debugging documents with dependencies using graph intelligence
```
cmd /c node scripts/smart-context-loader.js --workflow=docs-debug
```

**Graph-based loading includes:**
- React Effect Loop Prevention + common patterns
- Lint Issue Prevention + resolution strategies  
- Code Quality Standards + enforcement patterns

## Key Context Gained
- **Effect loops**: Common causes and prevention patterns
- **Lint issues**: ESLint/TypeScript error resolution
- **Performance**: React optimization debugging
- **Code quality**: Standards enforcement and validation
- **Common anti-patterns**: What to avoid and why

## Debugging Toolkit
✅ useEffect dependency debugging
✅ Re-render loop identification
✅ ESLint error resolution
✅ TypeScript type error fixes
✅ Performance bottleneck patterns
✅ Memory leak prevention

**Ready for debugging and optimization tasks**

This step loads relevant documents based on the document graph for debug workflow.

## Validation Check

// turbo
```bash
cmd /c node scripts/graph-analytics.js --health
```

Quick health check to ensure debug-related documentation is properly linked and accessible.
