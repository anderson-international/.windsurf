---
description: Run duplicate code detection to prevent type duplications
---

# Duplicate Code Detection

This workflow uses jscpd to detect duplicate TypeScript code and interfaces to prevent the type duplication issues we've encountered.

## Steps

1. Ensure jscpd is installed globally
// turbo
```bash
cmd /c npm list -g jscpd
```

2. Run duplicate detection
// turbo  
```bash
cmd /c jscpd --config .jscpd.json
```

3. If duplicates are found, review the HTML report:
```bash
cmd /c start jscpd-report.html
```

## Configuration

The `.jscpd.json` file is configured to:
- Scan TypeScript/TSX files in `types/`, `lib/`, `components/`, `app/`, `hooks/`
- Generate console and HTML reports
- Detect duplicates with minimum 3 lines or 15 tokens
- Ignore build/dist directories

## Usage

Run this workflow before major commits or when refactoring types to ensure no duplicates are introduced.
