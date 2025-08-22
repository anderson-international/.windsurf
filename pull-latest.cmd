@echo off
setlocal enabledelayedexpansion

:: Usage first (avoid parsing below when only help is needed)
if /i "%~1"=="/h" (
  echo Usage: .windsurf\pull-latest.cmd
  echo   Pulls the newest ws-vX.Y.Z tag from windsurf_repo into .windsurf using --squash.
  echo   Prefers moving tag ws-vlatest when available.
  echo   If windsurf_repo is missing, it will be auto-added.
  echo Prerequisite: None.
  echo Examples:
  echo   cmd /c .windsurf\pull-latest.cmd
  exit /b 0
)
if /i "%~1"=="-h" (
  echo Usage: .windsurf\pull-latest.cmd
  echo   Pulls the newest ws-vX.Y.Z tag from windsurf_repo into .windsurf using --squash.
  echo   Prefers moving tag ws-vlatest when available.
  echo   If windsurf_repo is missing, it will be auto-added.
  echo Prerequisite: None.
  echo Examples:
  echo   cmd /c .windsurf\pull-latest.cmd
  exit /b 0
)
if /i "%~1"=="--help" (
  echo Usage: .windsurf\pull-latest.cmd
  echo   Pulls the newest ws-vX.Y.Z tag from windsurf_repo into .windsurf using --squash.
  echo   Prefers moving tag ws-vlatest when available.
  echo   If windsurf_repo is missing, it will be auto-added.
  echo Prerequisite: None.
  echo Examples:
  echo   cmd /c .windsurf\pull-latest.cmd
  exit /b 0
)

echo === Windsurf Subtree: Pull Latest Release ===

:: Ensure remote exists
for /f "usebackq delims=" %%A in (`git remote get-url windsurf_repo 2^>nul`) do set "WS_URL=%%A"
if not defined WS_URL (
  echo Remote "windsurf_repo" not found. Adding it now ...
  cmd /c git remote add windsurf_repo https://github.com/anderson-international/.windsurf.git
  if errorlevel 1 (
    echo Error: Failed to add windsurf_repo remote. Please add it manually.
    exit /b 1
  )
  set "WS_URL=https://github.com/anderson-international/.windsurf.git"
)

echo Fetching tags from windsurf_repo ...
cmd /c git fetch windsurf_repo --tags
if errorlevel 1 exit /b 1

:: Determine latest tag: prefer moving tag ws-vlatest, else newest ws-v*
set "LATEST="
:: Try moving tag first
for /f "usebackq delims=" %%T in (`git for-each-ref --format="%%(refname:short)" refs/tags/ws-vlatest 2^>nul`) do (
  if not defined LATEST set "LATEST=%%T"
)
:: Fallback to newest versioned tag if no ws-vlatest
if not defined LATEST (
  for /f "usebackq delims=" %%T in (`git for-each-ref --sort=-version:refname --format="%%(refname:short)" refs/tags/ws-v* 2^>nul`) do (
    if not defined LATEST set "LATEST=%%T"
  )
)
if not defined LATEST (
  for /f "usebackq delims=" %%T in (`git for-each-ref --sort=-v:refname --format="%%(refname:short)" refs/tags/ws-v* 2^>nul`) do (
    if not defined LATEST set "LATEST=%%T"
  )
)

if not defined LATEST (
  echo Error: No tags found matching pattern ws-v*.
  exit /b 1
)

echo Latest tag resolved: %LATEST%

echo Pulling subtree into .windsurf using %LATEST% ...
cmd /c git subtree pull --prefix=.windsurf windsurf_repo %LATEST% --squash
if errorlevel 1 exit /b 1

echo Done. Subtree updated to %LATEST%.
exit /b 0
