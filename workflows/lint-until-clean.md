---
description: Perform a lint review and iterate until clean
---

**CRITICAL***
User requires all terminal commands to use Windows command console (cmd) syntax with the cmd /c prefix. Do not use PowerShell commands. Always format commands as "cmd /c [command]" for compatibility with the Windows environment.

## Workflow
// turbo
1. Perform a lint review:
   - Run the linting tool over the entire codebase.
   - Identify and list all linting errors and warnings.

2. Analyze lint output:
   - Review each reported linting issue.
   - Categorize issues by type and severity.

3. Plan fixes:
   - For each linting error or warning, determine the appropriate corrective action.
   - Prioritize critical and frequently occurring issues.

4. Implement fixes:
   - Apply corrections to the codebase to address each linting issue.
   - Document changes made for each fix.

5. Re-run lint review:
   - After applying fixes, run the linting tool again.
   - Confirm that the number of linting errors and warnings has decreased.

6. Iterate until clean:
   - Repeat steps 1–5 until no linting errors or warnings remain.
   - Ensure the codebase achieves a clean lint status.