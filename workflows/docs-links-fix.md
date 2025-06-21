---
description: Fix broken documentation links and sync document graph
---

# Fix Documentation Links

This workflow runs the comprehensive link fixer to resolve broken links and sync the document graph with the actual file system.

## Steps

// turbo
1. Run the comprehensive link fixer
```bash
cmd /c node docs/scripts/docs-links-fix.js
```

The script will automatically:
- Detect moved/renamed files by comparing document graph with file system
- Update all internal markdown links when files are moved
- Standardize link titles to consistent filename-based format
- Validate document graph integrity
- Fix any broken internal references

After running, all documentation links will be consistent and the document graph will match the actual file structure.
