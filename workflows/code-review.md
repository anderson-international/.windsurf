---
description: Review the code you have just written
---

## Code Review

### Load Critical AI Context
/run critical-context

### Ways of Working : Analyze → Report → Seek Approval → Execute

**Core Principles:**
- **Analyze First**: Thoroughly investigate issues before proposing solutions
- **Report Findings**: Document all discoveries and provide clear explanations
- **Seek Explicit Approval**: Never proceed with fixes without user confirmation
- **Execute Systematically**: Apply fixes methodically, one at a time


### Goal 1: Code Quality
We are going to review the code you have touched in this session, or has been specified by the user. Below is the checklist you must complete for each file.
[] Code file size limits
[] React loop prevention
[] React anti-patterns
[] API error handling
[] Database form patterns

**AI ACTION REQUIRED**: Ensure all the files are valid with respect to the stated principles


### Goal 2: Code Viability
Use the following checklist and produce a report that batches all the Lint and Typescript warnings and errors in terms of risk and severity.
[] Check for Typescript compilation errors
[] Check for ESLint warnings and errors

**AI ACTION REQUIRED**: Load Context
/run auto-context
