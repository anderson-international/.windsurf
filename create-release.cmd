@echo off
setlocal enabledelayedexpansion

:: Usage first (avoid parsing below when only help is needed)
if /i "%~1"=="/h" goto :USAGE
if /i "%~1"=="-h" goto :USAGE
if /i "%~1"=="--help" goto :USAGE

echo === Windsurf Subtree Release Creator ===
echo This script can run inside the upstream .windsurf repo OR target a nested .windsurf clone.
echo Upstream origin should be anderson-international/.windsurf.git

:: Parse args
set "BUMP=patch"
set "NO_LATEST="
set "ARG1=%~1"
set "ARG2=%~2"
if /i "%ARG1%"=="major" set "BUMP=major"
if /i "%ARG1%"=="minor" set "BUMP=minor"
if /i "%ARG1%"=="patch" set "BUMP=patch"
if /i "%ARG1%"=="--no-latest" set "ARG1=" & set "NO_LATEST=1"
if /i "%ARG2%"=="--no-latest" set "NO_LATEST=1"
if defined ARG1 (
  if /i not "%ARG1%"=="major" (
    if /i not "%ARG1%"=="minor" (
      if /i not "%ARG1%"=="patch" (
        echo Error: Unknown bump type "%ARG1%". Use major/minor/patch or omit.
        exit /b 1
      )
    )
  )
)

:: Detect target repo (current repo if upstream, else nested .windsurf clone)
set "TARGET_REPO="
set "ORIGIN_URL="
for /f "usebackq delims=" %%A in (`git remote get-url origin 2^>nul`) do set "ORIGIN_URL=%%A"
if defined ORIGIN_URL (
  set "TMP_STR=%ORIGIN_URL:.windsurf.git=%"
  if /i not "%TMP_STR%"=="%ORIGIN_URL%" set "TARGET_REPO=."
)
if not defined TARGET_REPO if exist ".windsurf\.git" set "TARGET_REPO=.windsurf"
if not defined TARGET_REPO (
  echo Error: Could not find an upstream .windsurf repo.
  echo - Run inside the upstream .windsurf clone, or
  echo - Ensure a nested .windsurf clone exists at .windsurf\
  exit /b 1
)

:: Display selected origin
set "SELECTED_ORIGIN="
if "%TARGET_REPO%"=="." (
  set "SELECTED_ORIGIN=%ORIGIN_URL%"
) else (
  for /f "usebackq delims=" %%A in (`git -C ".windsurf" remote get-url origin 2^>nul`) do set "SELECTED_ORIGIN=%%A"
)
echo Target repo: %TARGET_REPO%
echo Origin: %SELECTED_ORIGIN%

:: Ensure working tree is clean
set "DIRTY="
for /f "delims=" %%A in ('git -C "%TARGET_REPO%" status --porcelain') do set DIRTY=1
if defined DIRTY (
  echo Error: Working tree has uncommitted changes. Please commit/stash first.
  exit /b 1
)

:: Fetch tags
cmd /c git -C "%TARGET_REPO%" fetch origin --tags
if errorlevel 1 exit /b 1

:: Determine latest ws-v* tag
set "LATEST="
for /f "usebackq delims=" %%T in (`git -C "%TARGET_REPO%" for-each-ref --sort=-version:refname --format="%%^(refname^:short^)" refs/tags/ws-v* 2^>nul`) do (
  if not defined LATEST set "LATEST=%%T"
)
if not defined LATEST (
  for /f "usebackq delims=" %%T in (`git -C "%TARGET_REPO%" for-each-ref --sort=-v:refname --format="%%^(refname^:short^)" refs/tags/ws-v* 2^>nul`) do (
    if not defined LATEST set "LATEST=%%T"
  )
)

set "MAJOR=0"
set "MINOR=0"
set "PATCH=0"
if defined LATEST (
  set "TAGSTR=!LATEST:ws-v=!"
  for /f "tokens=1-3 delims=." %%a in ("!TAGSTR!") do (
    set "MAJOR=%%a"
    set "MINOR=%%b"
    set "PATCH=%%c"
  )
)

:: Increment version
if /i "%BUMP%"=="major" (
  set /a MAJOR=MAJOR+1
  set "MINOR=0"
  set "PATCH=0"
) else (
  if /i "%BUMP%"=="minor" (
    set /a MINOR=MINOR+1
    set "PATCH=0"
  ) else (
    set /a PATCH=PATCH+1
  )
)

set "NEWTAG=ws-v!MAJOR!.!MINOR!.!PATCH!"
echo Creating annotated tag !NEWTAG! ...
cmd /c git -C "%TARGET_REPO%" tag -a !NEWTAG! -m "Windsurf subtree release !NEWTAG!"
if errorlevel 1 exit /b 1

:: Update moving tag ws-vlatest unless suppressed
if not defined NO_LATEST (
  echo Updating moving tag ws-vlatest to !NEWTAG! ...
  cmd /c git -C "%TARGET_REPO%" tag -fa ws-vlatest !NEWTAG! -m "Windsurf latest -> !NEWTAG!"
  if errorlevel 1 exit /b 1
)

echo Pushing tags to origin ...
cmd /c git -C "%TARGET_REPO%" push origin --tags
if errorlevel 1 exit /b 1
if not defined NO_LATEST (
  cmd /c git -C "%TARGET_REPO%" push -f origin refs/tags/ws-vlatest
  if errorlevel 1 exit /b 1
)

echo Done. Created and pushed !NEWTAG!
exit /b 0

:USAGE
echo Usage: .windsurf\create-release.cmd [major/minor/patch] [--no-latest]
echo   Default bump is patch. Optional --no-latest skips updating ws-vlatest.
echo   Can run inside the upstream .windsurf repo, or in a consumer repo with a nested .windsurf clone.
echo Examples:
echo   cmd /c .windsurf\create-release.cmd
echo   cmd /c .windsurf\create-release.cmd minor
echo   cmd /c .windsurf\create-release.cmd patch --no-latest
exit /b 0
