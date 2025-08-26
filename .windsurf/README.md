# .windsurf Subtree

Self-contained developer tooling and documentation for Windsurf projects.

What it includes:
- Review tooling under `.windsurf/review/` (ESLint, TypeScript, Knip, JSCPD, unified analyzer)
- Common workflows under `.windsurf/workflows/`
- Guides and reference docs under `.windsurf/guides/`
- Utility scripts under `.windsurf/tools/`

Important policy:
- Treat `.windsurf/` as a vendored subtree. Prefer upstream changes in the subtree repo rather than direct edits in consumer projects.
- Consumers typically pull the moving tag `ws-vlatest`, or a specific semantic tag. Semantic tag scheme: `ws-vX.Y.Z`.

Repository source:
- Remote name: `windsurf_repo`
- Remote URL: `https://github.com/anderson-international/.windsurf.git`

## Integrate this subtree into your project (Windows)

Note: New Windsurf projects usually start with an empty `.windsurf/` directory. You must remove any existing local `.windsurf/` folder before adding the subtree.

1) Add the remote
```cmd
cmd /c git remote add windsurf_repo https://github.com/anderson-international/.windsurf.git
```

2) Ensure your working tree is clean, then delete any local `.windsurf/`
```cmd
cmd /c rmdir /s /q .windsurf
cmd /c git add -A
cmd /c git commit -m "Remove local .windsurf to prepare for subtree"
```

3) Add the subtree from a released tag (use --squash)
```cmd
cmd /c git fetch windsurf_repo --tags
cmd /c git subtree add --prefix=.windsurf windsurf_repo ws-vX.Y.Z --squash
```

4) Verify installation
```cmd
cmd /c node .windsurf\tools\schema-query.js --help
cmd /c node .windsurf\tools\docs-loader.js --list
cmd /c npm --prefix .windsurf\review run review:repo -- --help
```

## Updating to a newer release

1) Fetch latest tags
```cmd
cmd /c git fetch windsurf_repo --tags
```

2) Pull the desired tag into `.windsurf/` (use --squash)
```cmd
cmd /c git subtree pull --prefix=.windsurf windsurf_repo ws-vX.Y.Z --squash
```

## Automation

For convenience, two Windows cmd scripts are provided at the root of `.windsurf/`:

- Create a new upstream release tag (runs inside the upstream `.windsurf` repo OR targets a nested `.windsurf` clone if present):
  ```cmd
  cmd /c .windsurf\create-release.cmd
  cmd /c .windsurf\create-release.cmd minor
  cmd /c .windsurf\create-release.cmd patch --no-latest
  cmd /c .windsurf\create-release.cmd --help
  ```

- Pull the latest tagged release into your consumer project (no tag required):
  ```cmd
  cmd /c .windsurf\pull-latest.cmd
  cmd /c .windsurf\pull-latest.cmd --help
  ```

Notes:
- `create-release.cmd` detects and operates on the upstream `.windsurf` repo (if you're in it) or a nested clone at `.windsurf/` (if you're in a consumer repo). It requires a clean working tree, auto-determines the next `ws-vX.Y.Z` (default bump `patch`, supports `minor`/`major`), and by default also updates the moving tag `ws-vlatest` to the new release (use `--no-latest` to skip updating the moving tag).
- `pull-latest.cmd` auto-adds the `windsurf_repo` remote if missing, fetches tags, prefers the moving tag `ws-vlatest` when present, and otherwise falls back to the newest `ws-v*` semantic tag. It then performs a `git subtree pull --squash` into `.windsurf/`.

## Notes and troubleshooting

- Existing remote: If `windsurf_repo` already exists, skip the remote add step.
- Subtree already present: Use the pull command above to update instead of re-adding.
- Conflicts: Resolve as with any merge, then `cmd /c git add -A` and `cmd /c git commit`.
- Local edits in `.windsurf/`: These may be overwritten by future subtree pulls. Contribute changes upstream to the `.windsurf` repo when possible.
- Continuous validation: See `.windsurf/workflows/code-validation.md` and `.windsurf/workflows/code-review-fix.md`.
