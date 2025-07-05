---
description: Load schema tables for form development
---

# Schema Tables for Form Development

This workflow loads the essential schema information needed for building forms, particularly specification forms.

## Load Core Specification Table

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --table specifications
```

## Load Common Enum Tables

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --enums --page 1
```

## Load Junction Tables

// turbo
```bash
cmd /c node docs/scripts/schema-query.js --pattern "spec_*"
```

## Usage

This workflow provides the core schema information for:
- **Form field definitions** (from specifications table)
- **Dropdown/select options** (from enum tables)
- **Multi-select patterns** (from junction tables)

Each command respects the 7,800 byte output limit and provides navigation for additional data if needed.

## AI Instructions

After running these commands, you'll have the essential schema information to:
- Build specification forms with proper field types
- Populate dropdown menus with enum values
- Handle multi-select relationships via junction tables
- Apply proper validation rules and constraints
