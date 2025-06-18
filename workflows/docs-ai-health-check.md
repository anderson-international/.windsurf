---
description: Quick system health check with automated validation commands
---

# Document System Health Check

Quick validation of the document graph system, workflows, and overall project health.

## Graph Consistency Check

// turbo
```bash
cmd /c node scripts/graph-maintainer.js --validate
```

Validates document graph consistency, checking for broken references and missing files.

## Workflow Enhancement Status

// turbo
```bash
cmd /c node scripts/workflow-enhancer.js --status
```

Shows which workflows have been enhanced with graph-based loading.

## Graph Health Analysis

// turbo
```bash
cmd /c node scripts/graph-analytics.js --health
```

Analyzes overall graph health and identifies potential issues.

## Link Validation

// turbo
```bash
cmd /c node scripts/validate-links.js
```

Validates all markdown links and graph consistency.

## Smart Context Loader Test

// turbo
```bash
cmd /c node scripts/smart-context-loader.js --workflow=docs-ai-reboot
```

Tests the smart context loader with the core AI reboot workflow.

## Summary

This workflow provides a comprehensive health check of:
- ✅ Document graph consistency
- ✅ Workflow enhancement status  
- ✅ Link validation
- ✅ Smart context loading functionality
- ✅ Overall system health

All commands are marked with `// turbo` for automatic execution, providing immediate feedback on system status.