---
description: Load schema tables for API development and endpoints
---

# Schema for API Development

This workflow loads the essential schema information for building REST APIs and backend endpoints.

## Load Core Business Tables

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --table specifications
```

## Load User Context

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --table users
```

## Load Status & Workflow Enums

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --table enum_specification_statuses
```

## Load Integration Tables

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --table jotform_shopify
```

## Usage

This workflow provides schema information for:
- **CRUD API endpoints** (specifications as main resource)
- **Authentication context** (users and roles)
- **Status workflows** (published/revision states)
- **External integrations** (Shopify, JotForm sync)
- **Relationship handling** (foreign keys and constraints)

## AI Instructions

After running these commands, you'll have the schema information to:
- Design REST API endpoints for specifications
- Implement proper authentication and authorization
- Handle status-based workflows in API responses
- Build integration endpoints for external systems
- Apply proper validation and error handling
- Design efficient query patterns and indexes

## API Design Schema

The loaded schema supports:
- RESTful resource operations (GET, POST, PUT, DELETE)
- Status-based access control (published vs needs_revision)
- User-scoped operations (my specifications vs public)
- External system integrations (Shopify product sync)
- Relationship-aware responses (nested enum data)
