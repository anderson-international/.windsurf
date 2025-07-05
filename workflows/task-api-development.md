---
description: Complete context for building robust API endpoints
---

# API Development Task Context

This workflow loads all documentation needed for building high-quality API endpoints with proper error handling, authentication, and database integration.

## Steps

### 1. Load API Design Patterns
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js api-design
```

### 2. Load API Error Handling
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js api-errors
```

### 3. Load API Authentication
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js api-auth
```

### 4. Load API Validation
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js api-validation
```

### 5. Load Database Core Patterns
// turbo
```bash
cmd /c node docs/scripts/docs-loader.js db-core
```

### 6. Load API Schema Context
/run schema-api

## Context Loaded

After running this workflow, you'll have complete context for:
- RESTful API design patterns and URL structure
- Error handling and retry mechanisms
- Authentication and authorization patterns
- Input/output validation strategies
- Database integration patterns
- Live database schema for API endpoints
