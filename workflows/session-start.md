---
description: session start checks (print CWD and repo roots)
---

Run these before any changes to confirm context. Open a terminal in each repo you plan to touch and run locally in-place (no cd needed).

1. Print current working directory (CWD)
   - cmd /c echo CWD: %cd%

2. Print Git repository root (if in a Git repo)
   - cmd /c git rev-parse --show-toplevel

3. Optional quick status (helps verify correct repo/branch)
   - cmd /c git status -sb
   - cmd /c git remote -v

Notes:
- Run these in each repo you’ll be working in, e.g.:
  - c:\Users\Jonny\Code\.windsurf
  - c:\Users\Jonny\Code\shopify-shipping
- I will include “Cwd” and the output of “git rev-parse --show-toplevel” before any Git operations to make the base directory explicit.
