---
description: Pull the latest .windsurf subtree from the shared subtree repository
auto_execution_mode: 3
---

Prerequisites:
- Remote `windsurf_subtree` points to `https://github.com/zantha-im/.windsurf.git`.
- Ensure your working tree is clean (or manually stash changes) before running this workflow; it does not manage stashes automatically.

Steps:
1) Ensure the subtree remote exists (no-op if already present)
// turbo
cmd /c git remote get-url windsurf_subtree || git remote add windsurf_subtree https://github.com/zantha-im/.windsurf.git

2) Fetch the subtree remote
// turbo
cmd /c git fetch windsurf_subtree

3) Pull updates into `.windsurf/` using subtree with squash
// turbo
cmd /c git subtree pull --prefix=.windsurf windsurf_subtree main --squash

4) If the subtree's review dependencies changed, reinstall them (Windows)
// turbo
cmd /c (git diff --name-only HEAD~1 HEAD | findstr /I /C:".windsurf/review/package.json" >nul) && npm install --prefix .windsurf\review || echo no-review-deps-change

Notes:
- `--squash` keeps the main repo history clean while updating only `.windsurf/` files.
- If merge conflicts occur, they will be confined to files under `.windsurf/`. Resolve and commit as usual.
- If you need to pull from a non-main branch, replace `main` with the desired branch.