---
description: Complete context for debugging React performance and loop issues
---

# React Debugging Task Context

This workflow loads all documentation needed for debugging React applications, including performance issues, infinite loops, and component problems.

## Steps

### 1. Load React Fundamentals
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js react-fundamentals
```

### 2. Load React Loop Prevention
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js react-loops
```

### 3. Load React Debugging Tools
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js react-debugging
```

### 4. Load React Performance Patterns
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js react-antipatterns
```

### 5. Load React Testing
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js react-testing
```

### 6. Load Development Schema Context
/run schema-dev

## Context Loaded

After running this workflow, you'll have complete context for:
- React hook patterns and dependency management
- Infinite loop prevention and troubleshooting
- Debugging techniques and performance monitoring
- Performance anti-patterns and optimization
- Testing patterns and debugging tools
- Comprehensive database schema for development and testing
