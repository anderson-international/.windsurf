---
description: Complete context for building React forms to a good standard
---

# Form Development Task Context

This workflow loads all documentation needed for building high-quality React forms with proper validation, UI design, and database integration.

## Steps

### 1. Load React Form Fundamentals

// turbo

```bash
cmd /c node docs/scripts/docs-loader.js react-fundamentals
```

### 2. Load React Form Components

// turbo

```bash
cmd /c node docs/scripts/docs-loader.js react-components
```

### 3. Load UI Design Patterns

// turbo

```bash
cmd /c node docs/scripts/docs-loader.js ui-design
```

### 4. Load Database Form Patterns

// turbo

```bash
cmd /c node docs/scripts/docs-loader.js db-forms
```

### 5. Load Database Enum Integration

// turbo

```bash
cmd /c node docs/scripts/docs-loader.js db-enums
```

### 6. Load Form Schema Context

/run schema-forms

### 6. Load API Schema Context

/run schema-api

## Context Loaded

After running this workflow, you'll have complete context for:

- React hook patterns (useCallback, useMemo, useEffect)
- TypeScript requirements for forms
- Server vs Client component patterns
- UI design system and form patterns
- Database schema-driven form development
- Enum integration and junction table handling
- Live database schema for forms
- Live database schema for API
