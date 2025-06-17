---
description: Run npm build iteratively until the build is clean
---

**CRITICAL***
User requires all terminal commands to use Windows command console (cmd) syntax with the cmd /c prefix. Do not use PowerShell commands. Always format commands as "cmd /c [command]" for compatibility with the Windows environment.

## Workflow
// turbo
1. Perform a build review:
   - Run the command npm run build
   - Identify and list all build errors and warnings.

2. Analyze build output:
   - Review each reported build issue.
   - Categorize issues by type and severity.

3. Plan fixes:
   - For each error or warning, determine the appropriate corrective action.
   - Prioritize critical and frequently occurring issues.

4. Implement fixes:
   - Apply corrections to the codebase to address each linting issue.
   - Report changes made for each fix.

5. Re-run build review:
   - After applying fixes, run the npm build command again.
   - Confirm that the number of errors and warnings has decreased.

6. Iterate until clean:
   - Repeat steps 1–5 until no errors or warnings remain.
   - Ensure the codebase achieves a clean build status.