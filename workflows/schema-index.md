---
description: Load database schema index and navigation guide
---

# Schema Index & Navigation

## Load Schema Index

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --index
```

**Expected Result**: The script will output a complete table catalog with navigation commands for loading specific schema information.

**AI Instructions**: After running this command, follow the navigation instructions in the output to load the specific schema data you need for your current task.

## Features

- **Size-aware**: All outputs respect 7,800 byte limit
- **Paginated**: Large result sets are automatically chunked
- **Navigation**: Clear instructions for loading additional data
- **Fresh data**: Always queries live database

## Common Follow-up Commands

Based on the index output, you'll typically run:

- `cmd /c node docs/scripts/schema-query.js --table specifications` (for form development)
- `cmd /c node docs/scripts/schema-query.js --enums --page 1` (for enum/dropdown data)
- `cmd /c node docs/scripts/schema-query.js --pattern spec_*` (for junction tables)

This workflow validates the core schema query system - all schema information is now available on-demand without file size constraints.
