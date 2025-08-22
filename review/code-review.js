#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { applyAutofix } = require('./components/autofix/apply');

const { ROOT_DIR, OUTPUT_DIR, RESULTS_FILE, toRepoRelative, ensureDir } = require('./components/utils/paths');
const { FILE_SIZE_LIMITS, getFileType, isReviewablePath } = require('./components/utils/filters');
const { countLines, writeJson, deleteStaleReports } = require('./components/utils/fs-utils');
const { collectPorcelainFiles } = require('./components/utils/git');
const { mapLimit } = require('./components/utils/concurrency');

const { analyzeComments } = require('./components/per-file/analyze-comments');
const { analyzeReactPatterns } = require('./components/per-file/analyze-react');
const { analyzeConsoleErrors } = require('./components/per-file/analyze-console');
const { runEslint, runEslintBatch } = require('./components/per-file/run-eslint');
const { analyzeTypeScript } = require('./components/per-file/analyze-typescript');
const { analyzeFallbackData } = require('./components/per-file/analyze-fallback');

const { runKnip } = require('./components/repo/run-knip');
const { runJscpd } = require('./components/repo/run-jscpd');
const { runTsc } = require('./components/repo/run-tsc');

const { applyKnipToResults } = require('./components/merge/knip');
const { applyJscpdToResults } = require('./components/merge/jscpd');

const { generateCompactSummary, generateBatchSummary, generateMinimalSummary } = require('./components/summaries');

function printUsage() {
  const usage = [
    'Usage: cmd /c node .windsurf/review/code-review.js <file1> [file2 ...]',
    '',
    'Description:',
    '  Modular code review analyzer for TypeScript/TSX files:',
    '  - File size limits by directory type',
    '  - Disallowed comments (inline, JSDoc, multi-line)',
    '  - React usage patterns',
    '  - console.error/console.warn fail-fast violations',
    '  - ESLint errors/warnings (via npx eslint)',
    '  - TypeScript compiler diagnostics (via npx tsc --noEmit)',
    '  - Fallback data anti-patterns',
    '  - Dead code & unresolved imports (via knip)',
    '  - Duplicate code (via jscpd)',
    '',
    'Flags:',
    '  --porcelain                Auto-select changed TS/TSX files via git porcelain',
    '  --concurrency <n>          Limit per-file parallelism (default 8)',
    '  --jscpd-min-tokens <n>     Set JSCPD min tokens (default 50)',
    '  --jscpd-include <dirs>     Comma-separated include roots (default: app,components,lib,hooks,types; use "." for repo)',
    '  --no-autofix               Disable default auto-fix of comments/console lines',
    '  --debug                    Print extra debug details; summaries always include total time',
    '  --report-all               Include all files in JSON report if report is written',
    '  --tsconfig <path>          Use a specific tsconfig.json (default: repo root tsconfig.json)',
    '  --skip-tsc                 Skip TypeScript compiler checks',
    '',
    'Default behavior:',
    '  • If no files are specified (and not in --porcelain mode), all valid TypeScript files are analyzed',
    '    under: app/, components/, lib/, hooks/, types/ (excluding .d.ts and excluded dirs)',
    '',
    'Exit codes:',
    '  0  All checks passed',
    '  1  One or more violations found or write error',
  ].join('\n');
  console.log(usage);
}

// Format milliseconds as minutes and seconds, e.g., "2m 03s"
function formatMs(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '0m 00s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');
  return `${minutes}m ${ss}s`;
}

// Auto-discover reviewable TS/TSX files across valid repo roots
function discoverReviewableTypeScriptFiles() {
  const includeRoots = ['app', 'components', 'lib', 'hooks', 'types'];
  const excludeDirs = new Set(['node_modules', '.git', '.windsurf', 'test']);
  const out = [];

  function walk(dirAbs) {
    let entries;
    try {
      entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch (_) {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dirAbs, ent.name);
      if (ent.isDirectory()) {
        if (excludeDirs.has(ent.name)) continue;
        walk(full);
      } else {
        // Build repo-relative path and reuse isReviewablePath()
        const rel = path.relative(ROOT_DIR, full).replace(/\\/g, '/');
        if (isReviewablePath(rel)) out.push(full);
      }
    }
  }

  for (const root of includeRoots) {
    const abs = path.join(ROOT_DIR, root);
    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) walk(abs);
    } catch (_) {}
  }

  return out;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  // Parse args
  let concurrency = 8;
  let jscpdMinTokens = undefined;
  let jscpdIncludeRoots = undefined;
  let debugMode = false;
  let reportAll = false;
  let tsconfigOverride = undefined;
  let skipTsc = false;
  let porcelainMode = false;
  let noAutofix = false;

  const files = [];
  let hadExplicitFiles = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--concurrency') {
      const v = args[++i];
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n > 0) concurrency = n;
      continue;
    }
    if (a.startsWith('--concurrency=')) {
      const v = a.split('=')[1];
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n > 0) concurrency = n;
      continue;
    }
    if (a === '--jscpd-min-tokens') { jscpdMinTokens = parseInt(args[++i], 10); continue; }
    if (a.startsWith('--jscpd-min-tokens=')) { const v = a.split('=')[1]; const n = parseInt(v, 10); if (!Number.isNaN(n)) jscpdMinTokens = n; continue; }
    if (a === '--jscpd-include') { const v = args[++i]; if (typeof v === 'string') jscpdIncludeRoots = v.split(',').map(s => s.trim()).filter(Boolean); continue; }
    if (a.startsWith('--jscpd-include=')) { const v = a.split('=')[1]; if (typeof v === 'string') jscpdIncludeRoots = v.split(',').map(s => s.trim()).filter(Boolean); continue; }
    if (a === '--debug') { debugMode = true; continue; }
    if (a === '--report-all') { reportAll = true; continue; }
    if (a === '--no-autofix') { noAutofix = true; continue; }
    if (a === '--tsconfig') { const v = args[++i]; if (typeof v === 'string') tsconfigOverride = path.isAbsolute(v) ? v : path.join(ROOT_DIR, v); continue; }
    if (a.startsWith('--tsconfig=')) { const v = a.split('=')[1]; if (typeof v === 'string') tsconfigOverride = path.isAbsolute(v) ? v : path.join(ROOT_DIR, v); continue; }
    if (a === '--skip-tsc') { skipTsc = true; continue; }
    if (a === '--porcelain') { porcelainMode = true; continue; }
    files.push(a);
    hadExplicitFiles = true;
  }

  const t0 = Date.now();

  // Porcelain collection
  if (porcelainMode && files.length === 0) {
    const collected = collectPorcelainFiles();
    for (const f of collected) files.push(f);
    if (debugMode) {
      const rels = files.map(toRepoRelative);
      console.log(`Porcelain selected ${rels.length} file(s): ${rels.join(', ')}`);
    }
  }

  if (files.length === 0) {
    if (porcelainMode) {
      // Minimal report for porcelain with no selected files
      try {
        ensureDir(OUTPUT_DIR);
        const tNow = Date.now();
        const timing = { autofixMs: 0, perFileMs: 0, repoMs: 0, totalMs: (tNow - t0) };
        const reviewMode = 'Touched Files Only';
        const payload = {
          generatedAt: new Date().toISOString(),
          args: process.argv.slice(2),
          options: { concurrency, jscpdMinTokens, jscpdIncludeRoots, porcelainMode, noAutofix, debugMode, tsconfigOverride, skipTsc },
          timing,
          reviewMode,
          filesAnalyzed: 0,
          results: [],
          summary: { status: 'pass', noViolations: true, porcelainNoFiles: true, message: 'No files selected by porcelain. No analysis performed. No further action required.' },
          repo: {
            knip: { unusedFiles: 0, unusedExports: 0, unusedTypes: 0, unusedEnumMembers: 0, unusedClassMembers: 0, unlistedDependencies: 0, unresolvedImports: 0 },
            knipDetails: { unresolvedImports: [], unlistedDependencies: [] },
            jscpd: { groups: 0, duplicatedLines: 0, percentage: 0 },
            tsc: { totalErrors: 0, tsconfigPath: tsconfigOverride || path.join(ROOT_DIR, 'tsconfig.json') }
          }
        };
        writeJson(RESULTS_FILE, payload);
        const repoSummary = { knip: payload.repo.knip, jscpd: payload.repo.jscpd, tsc: payload.repo.tsc };
        const minimal = generateMinimalSummary([], { timing, debugMode, repo: repoSummary, reportPath: toRepoRelative(RESULTS_FILE), reviewMode });
        console.log(minimal);
        process.exit(0);
      } catch (err) {
        console.error(`Failed to write porcelain no-files report: ${err && err.message}`);
        process.exit(1);
      }
    }
    // Auto-discover all reviewable TypeScript files under valid roots
    const discovered = discoverReviewableTypeScriptFiles();
    if (debugMode) console.log(`Auto-discovered ${discovered.length} reviewable file(s).`);
    if (discovered.length === 0) {
      console.error('No reviewable TypeScript files found under app/, components/, lib/, hooks/, types/.');
      process.exit(1);
    }
    for (const f of discovered) files.push(f);
  }

  // Delete stale legacy reports
  try { deleteStaleReports(); } catch (_) {}

  // Normalize to absolute paths and filter reviewable TS/TSX
  const absFilesIn = files.map(fp => path.isAbsolute(fp) ? fp : path.join(ROOT_DIR, fp));
  const absFiles = absFilesIn.filter(p => isReviewablePath(path.relative(ROOT_DIR, p).replace(/\\/g, '/')));

  // Optional autofix
  const autofix = { enabled: !noAutofix && process.env.CODE_REVIEW_NO_AUTOFIX !== '1', filesProcessed: 0, commentsRemoved: 0, consolesRemoved: 0, errors: 0 };
  const tAutofix0 = Date.now();
  if (autofix.enabled) {
    try {
      const stats = await applyAutofix(absFiles, { concurrency });
      autofix.filesProcessed = stats.filesProcessed || 0;
      autofix.commentsRemoved = stats.commentsRemoved || 0;
      autofix.consolesRemoved = stats.consolesRemoved || 0;
      autofix.errors = stats.errors || 0;
    } catch (err) {
      // Continue without blocking the rest of the analysis
    }
  }
  const tAutofix1 = Date.now();

  // Start repo-wide analyzers concurrently right after autofix (they will run in parallel with ESLint batch and per-file work)
  const tRepo0 = Date.now();
  const repoBreakdown = {};
  const pKnip = (async () => {
    const s = Date.now();
    const d = await runKnip();
    repoBreakdown.knipMs = Date.now() - s;
    return d;
  })();
  const pJscpd = (async () => {
    const s = Date.now();
    const d = await runJscpd({ includeRoots: jscpdIncludeRoots, minTokens: jscpdMinTokens });
    repoBreakdown.jscpdMs = Date.now() - s;
    return d;
  })();
  const pTsc = (async () => {
    const s = Date.now();
    const d = skipTsc
      ? { byFile: {}, totalErrors: 0, tsconfigPath: (tsconfigOverride || path.join(ROOT_DIR, 'tsconfig.json')) }
      : await runTsc(tsconfigOverride);
    repoBreakdown.tscMs = Date.now() - s;
    return d;
  })();

  // Optional ESLint batch (single run) to speed up per-file phase
  const useEslintBatch = process.env.CODE_REVIEW_ESLINT_BATCH !== '0';
  let eslintMap = {};
  let eslintBatchMs = 0;
  if (useEslintBatch) {
    const tEslintBatch0 = Date.now();
    try {
      const CHUNK_SIZE = 200;
      for (let i = 0; i < absFiles.length; i += CHUNK_SIZE) {
        const chunk = absFiles.slice(i, i + CHUNK_SIZE);
        const partial = await runEslintBatch(chunk);
        for (const [k, v] of Object.entries(partial)) {
          eslintMap[k] = v;
        }
      }
    } catch (_) {}
    eslintBatchMs = Date.now() - tEslintBatch0;
    if (debugMode) console.log(`[eslint-batch] analyzed ${Object.keys(eslintMap).length} file(s) in ${formatMs(eslintBatchMs)}`);
  }

  // Per-file analysis in parallel
  const tFiles0 = Date.now();
  const results = await mapLimit(absFiles, concurrency, async (filePath) => {
    const rel = toRepoRelative(filePath);
    const fileType = getFileType(filePath);
    const limit = FILE_SIZE_LIMITS[fileType];
    const tLines0 = Date.now();
    const lines = countLines(filePath);
    const linesMs = Date.now() - tLines0;
    const size = { lines, limit, status: (typeof limit === 'number' && lines > limit) ? 'FAIL' : 'PASS' };
    
    const tComments0 = Date.now();
    const commentsArr = analyzeComments(filePath);
    const commentsMs = Date.now() - tComments0;
    const comments = { count: commentsArr.length, status: commentsArr.length === 0 ? 'PASS' : 'FAIL' };
    
    const tReact0 = Date.now();
    const react = analyzeReactPatterns(filePath);
    const reactMs = Date.now() - tReact0;

    const tConsole0 = Date.now();
    const consoleErrors = analyzeConsoleErrors(filePath);
    const consoleMs = Date.now() - tConsole0;

    const tEslint0 = Date.now();
    const eslint = useEslintBatch ? (eslintMap[filePath] || runEslint(filePath)) : runEslint(filePath);
    const eslintMs = Date.now() - tEslint0;

    const tTs0 = Date.now();
    const typescript = analyzeTypeScript(filePath);
    const typescriptMs = Date.now() - tTs0;

    const tFallback0 = Date.now();
    const fallbackData = analyzeFallbackData(filePath);
    const fallbackMs = Date.now() - tFallback0;

    const timing = { linesMs, commentsMs, reactMs, consoleMs, eslintMs, typescriptMs, fallbackMs };

    return { filePath: filePath, relPath: rel, fileType, size, comments, react, consoleErrors, eslint, typescript, fallbackData, timing };
  });
  const tFiles1 = Date.now();

  // Repo-wide analyzers results
  const [knipData, jscpdData, tscData] = await Promise.all([pKnip, pJscpd, pTsc]);
  const tRepo1 = Date.now();

  // Attach TSC per-file
  try {
    const byFile = tscData && tscData.byFile ? tscData.byFile : {};
    for (const r of results) {
      const key = toRepoRelative(r.filePath);
      const errs = byFile[key] || [];
      r.typescriptCompiler = { errorCount: errs.length, errors: errs, status: errs.length === 0 ? 'PASS' : 'FAIL' };
    }
  } catch (_) {}

  // Merge repo-wide results
  const knipAgg = applyKnipToResults(results, knipData || {});
  const jscpdAgg = applyJscpdToResults(results, jscpdData || {});

  // Repo-wide violation detection and summary
  const repoViolation = ((tscData.totalErrors || 0) > 0) ||
    (knipAgg.summary.unusedFiles > 0 ||
     knipAgg.summary.unusedExports > 0 ||
     knipAgg.summary.unusedTypes > 0 ||
     knipAgg.summary.unusedEnumMembers > 0 ||
     knipAgg.summary.unusedClassMembers > 0 ||
     knipAgg.summary.unlistedDependencies > 0 ||
     knipAgg.summary.unresolvedImports > 0) ||
    (jscpdAgg.summary.groups > 0 ||
     jscpdAgg.summary.duplicatedLines > 0 ||
     jscpdAgg.summary.percentage > 0);

  const repoSummary = {
    knip: knipAgg.summary,
    jscpd: jscpdAgg.summary,
    tsc: { totalErrors: tscData.totalErrors || 0, tsconfigPath: tscData.tsconfigPath || null }
  };

  // Summaries and result JSON (with timing)
  const t1 = Date.now();
  const timing = {
    autofixMs: (tAutofix1 - tAutofix0),
    perFileMs: (tFiles1 - tFiles0),
    repoMs: (tRepo1 - tRepo0),
    totalMs: (t1 - t0),
    eslintBatchMs,
    repoBreakdown
  };

  const reviewMode = porcelainMode ? 'Touched Files Only' : (hadExplicitFiles ? 'File List Supplied' : 'Full Project Scan');
  const minimalSummary = generateMinimalSummary(results, { timing, debugMode, repo: repoSummary, reportPath: toRepoRelative(RESULTS_FILE), reviewMode });
  console.log(minimalSummary);

  // Determine if any violations exist
  const perFileViolation = results.some(r =>
    r.eslint.errors.length > 0 || r.eslint.warnings.length > 0 ||
    r.comments.status === 'FAIL' || r.size.status === 'FAIL' ||
    r.typescript.status === 'FAIL' || (r.typescriptCompiler && r.typescriptCompiler.status === 'FAIL') ||
    r.consoleErrors.status === 'FAIL' || r.fallbackData.status === 'FAIL' ||
    (r.deadCode && r.deadCode.status === 'FAIL') || (r.duplicates && r.duplicates.status === 'FAIL')
  );
  const anyViolation = perFileViolation || repoViolation;

  // Write JSON report always (concise payload on zero violations)
  try {
    ensureDir(OUTPUT_DIR);
    const hasViolations = anyViolation;
    const resultsToWrite = hasViolations
      ? (reportAll ? results : results.filter(r => (
          r.eslint.errors.length > 0 || r.eslint.warnings.length > 0 || r.comments.status === 'FAIL' || r.size.status === 'FAIL' || r.typescript.status === 'FAIL' || r.consoleErrors.status === 'FAIL' || r.fallbackData.status === 'FAIL' || (r.typescriptCompiler && r.typescriptCompiler.status === 'FAIL') || (r.deadCode && r.deadCode.status === 'FAIL') || (r.duplicates && r.duplicates.status === 'FAIL')
        )))
      : (reportAll ? results : []);

    const payload = {
      generatedAt: new Date().toISOString(),
      args: process.argv.slice(2),
      options: { concurrency, jscpdMinTokens, jscpdIncludeRoots, porcelainMode, noAutofix, debugMode, tsconfigOverride, skipTsc },
      timing,
      reviewMode,
      filesAnalyzed: results.length,
      results: resultsToWrite,
      summary: hasViolations
        ? { status: 'fail', message: 'Violations detected. Action required.' }
        : { status: 'pass', noViolations: true, message: 'No violations detected. No further action required.' },
      repo: {
        knip: knipAgg.summary,
        knipDetails: knipAgg.details || { unresolvedImports: [], unlistedDependencies: [] },
        jscpd: jscpdAgg.summary,
        tsc: { totalErrors: tscData.totalErrors || 0, tsconfigPath: tscData.tsconfigPath || null }
      }
    };
    writeJson(RESULTS_FILE, payload);
    if (debugMode) console.log(`Wrote report: ${toRepoRelative(RESULTS_FILE)}`);
    // Minimal summary already includes CTA; keep additional notices only in debug mode.
    if (debugMode) {
      if (hasViolations) {
        console.log(`AI ACTION REQUIRED: Consume and process this report → ${toRepoRelative(RESULTS_FILE)}`);
      } else {
        console.log(`No violations detected. Report written → ${toRepoRelative(RESULTS_FILE)}`);
      }
    }
  } catch (err) {
    console.error(`Failed to write report: ${err && err.message}`);
    process.exit(1);
  }

  // Debug timing (detailed breakdown, minutes/seconds)
  if (debugMode) {
    console.log('[timing] autofix:', formatMs(timing.autofixMs));
    console.log('[timing] per-file:', formatMs(timing.perFileMs));
    console.log('[timing] repo-wide:', formatMs(timing.repoMs));
    if (timing.eslintBatchMs) console.log('[timing] eslint-batch:', formatMs(timing.eslintBatchMs));
    console.log('[timing] total:', formatMs(timing.totalMs));
  }

  process.exit(anyViolation ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err && err.stack || err);
  process.exit(1);
});
