---
description: Load all schema tables for comprehensive development context
---

# All Schema Tables

This workflow loads comprehensive schema information for development, testing, and debugging purposes.

## Load All Table Relationships

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --index
```

## Load Core Table with Full Details

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --table specifications
```

## Load All Junction Tables

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --pattern spec_*
```

## Usage

This workflow provides comprehensive schema information for:

- **Database relationship mapping** (all foreign keys and constraints)
- **Performance optimization** (indexes and query patterns)
- **Data validation** (field types, nullability, constraints)
- **Test data structure** (complete table schemas)

## AI Instructions

After running these commands, you'll have the schema information to:

- Debug database relationship issues
- Optimize query performance using indexes
- Understand data flow through integration pipelines
- Validate data integrity and constraints
- Design efficient database migrations
- Troubleshoot foreign key and constraint violations

## Development Schema

The loaded schema supports:

- **Full relationship mapping** (understand all table connections)
- **Performance analysis** (identify optimal query patterns)
- **Migration planning** (understand schema dependencies)
- **Constraint validation** (ensure data integrity rules)