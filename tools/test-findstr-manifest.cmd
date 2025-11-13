@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Test 1: Echo-based sanity check (no git required)
echo === Echo test ===
echo review/package.json | findstr /I /C:review/package.json >nul
if %errorlevel%==0 (
  echo ECHO_MATCH: pattern matched as expected
) else (
  echo ECHO_MISS: pattern did not match (unexpected)
)

REM Test 2: Git diff-based check (requires at least 2 commits)
echo.
echo === Git diff test (requires HEAD and HEAD~1) ===
for /f "usebackq tokens=*" %%c in (`git rev-list --count HEAD 2^>nul`) do set COMMITS=%%c
if not defined COMMITS (
  echo SKIP: Not a git repo or git not available on PATH
  goto :EOF
)

set /a HAVE_TWO_COMMITS=%COMMITS% GEQ 2 >nul 2>&1
if %HAVE_TWO_COMMITS%==0 (
  echo SKIP: Need at least 2 commits to diff (have %COMMITS%)
  goto :EOF
)

echo Running: git diff --name-only HEAD~1 HEAD ^| findstr /I /C:review/package.json
git diff --name-only HEAD~1 HEAD | findstr /I /C:review/package.json >nul
if %errorlevel%==0 (
  echo FOUND: review/package.json changed between HEAD~1 and HEAD
) else (
  echo NOT_FOUND: review/package.json not changed between HEAD~1 and HEAD
)

endlocal
