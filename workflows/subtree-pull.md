---
description: Bootstrap or pull the latest .windsurf subtree from the shared subtree repository (no versioning)
auto_execution_mode: 3
---

Prerequisites:
- Remote `windsurf_subtree` points to `https://github.com/anderson-international/.windsurf.git`.
- This workflow will auto-stash and restore local changes if needed.

Choose one path:
- If this is a new project without `.windsurf/`, use the Bootstrap section below, then stop.
- If `.windsurf/` already exists, skip Bootstrap and use "Update existing installation".

Bootstrap (first-time setup if `.windsurf/` is missing):
1) Ensure clean working tree (recommended)
// turbo
cmd /c git status --porcelain

2) Ensure the subtree remote exists (no-op if already present)
// turbo
cmd /c git remote get-url windsurf_subtree || git remote add windsurf_subtree https://github.com/anderson-international/.windsurf.git

3) Fetch the subtree remote
// turbo
cmd /c git fetch windsurf_subtree

4) Add the subtree into `.windsurf/` with squash
// turbo
cmd /c git subtree add --prefix=.windsurf windsurf_subtree main --squash

5) Run the npm setup workflow to install dependencies for review tooling
- Run workflow: /subtree-npm

Important:
- If you just completed Bootstrap, stop here. Do not run the update steps below now.

Update existing installation:
1) Optional: verify clean working tree
// turbo
cmd /c git status --porcelain

2) Conditionally stash local changes (only if changes exist)
// turbo
cmd /c (git diff --quiet && git diff --cached --quiet) || git stash push -u -k -m windsurf_subtree_autostash

3) Fetch the subtree remote
// turbo
cmd /c git fetch windsurf_subtree

4) Pull updates into `.windsurf/` using subtree with squash
// turbo
cmd /c git subtree pull --prefix=.windsurf windsurf_subtree main --squash

5) Conditionally pop the stash (only if our marker stash exists)
// turbo
cmd /c (git stash list | findstr windsurf_subtree_autostash >nul) && git stash pop || echo no-stash-to-pop

Notes:
- `--squash` keeps the main repo history clean while updating only `.windsurf/` files.
- If merge conflicts occur, they will be confined to files under `.windsurf/`. Resolve and commit as usual.
- If you need to pull from a non-main branch, replace `main` with the desired branch.