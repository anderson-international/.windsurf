#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..', '..');
const ANALYSIS_FILE = path.join(__dirname, '..', 'review', 'output', 'code_review_analysis.json');
const LEGACY_ANALYSIS_FILE = path.join(__dirname, '..', 'review', 'code_review.json');
const TMP_JSCPD_DIR = path.join(__dirname, '..', 'review', 'output', '.tmp', 'jscpd');
const FILE_SIZE_LIMITS = {
  components: 150,
  hooks: 100,
  types: 100,
  utils: 50,
  routes: 100,
  services: 100,
  repositories: 100
};

function deleteStaleAnalysis() {
  try {
    // Clean new canonical report
    if (fs.existsSync(ANALYSIS_FILE)) fs.unlinkSync(ANALYSIS_FILE);
    // Cleanup legacy report (tech-debt removal)
    if (fs.existsSync(LEGACY_ANALYSIS_FILE)) fs.unlinkSync(LEGACY_ANALYSIS_FILE);
  } catch (error) {
    console.error(`Warning: Could not delete stale analysis file: ${error.message}`);
  }
}

function getFileType(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  if (dirName.includes('components')) return 'components';
  if (dirName.includes('hooks')) return 'hooks';
  if (dirName.includes('types')) return 'types';
  if (dirName.includes('services')) return 'services';
  if (dirName.includes('repositories')) return 'repositories';
  if (dirName.includes('app') && fileName.includes('route')) return 'routes';
  if (dirName.includes('lib') || dirName.includes('utils')) return 'utils';
  
  return 'components'; // default
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

// Normalize any absolute/relative path to repo-relative (for stable JSON keys)
function toRepoRelative(p) {
  try {
    const abs = path.isAbsolute(p) ? p : path.resolve(p);
    return path.relative(ROOT_DIR, abs) || p;
  } catch (e) {
    return p;
  }
}

// Determine if a repo-relative path is a reviewable production TypeScript file
function isReviewablePath(relPath) {
  try {
    const n = String(relPath || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
    // Restrict to production directories
    if (!/^(app|components|lib|hooks|types)\//.test(n)) return false;
    // Exclusions
    if (/^docs\//.test(n)) return false;
    if (/^test\//.test(n)) return false;
    if (/^\.windsurf\//.test(n)) return false;
    if (/node_modules\//.test(n)) return false;
    if (/\.d\.ts$/i.test(n)) return false; // exclude declaration files
    // Only .ts or .tsx
    if (!/\.(ts|tsx)$/i.test(n)) return false;
    return true;
  } catch (_) {
    return false;
  }
}

// Collect changed files using `git status --porcelain -z` and return absolute paths
function collectPorcelainFiles() {
  try {
    const out = execSync('git status --porcelain -z', { cwd: ROOT_DIR, encoding: 'utf8' });
    const tokens = out.split('\0').filter(Boolean);
    const rels = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (!t || t.length < 3) continue;
      const xy = t.slice(0, 2);
      const rest = t.slice(3); // path after status and space
      if (xy[0] === 'R' || xy[0] === 'C') {
        // Renames/Copies provide two paths in -z: take the destination path (next token) if available
        const next = tokens[i + 1];
        const newPath = (typeof next === 'string' && next.length > 0) ? next : rest;
        if (isReviewablePath(newPath)) rels.push(newPath.trim());
        if (typeof next === 'string' && next.length > 0) i += 1; // consume the extra token
      } else {
        const p = rest.trim();
        if (isReviewablePath(p)) rels.push(p);
      }
    }
    // de-duplicate and convert to absolute paths
    const uniqueAbs = Array.from(new Set(rels)).map(r => path.join(ROOT_DIR, r));
    return uniqueAbs;
  } catch (e) {
    console.error(`Error running git porcelain: ${e.message}`);
    return [];
  }
}

function analyzeComments(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const violations = [];
    let inJsDoc = false;
    let inMultiLine = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;
      
      // JSDoc comments
      if (line.startsWith('/**')) {
        inJsDoc = true;
        violations.push({ type: 'jsdoc', line: lineNum, content: line });
        continue;
      }
      
      // Multi-line comments
      if (line.startsWith('/*') && !line.startsWith('/**')) {
        inMultiLine = true;
        violations.push({ type: 'multiline', line: lineNum, content: line });
        continue;
      }
      
      // End of comments
      if (line.endsWith('*/')) {
        inJsDoc = false;
        inMultiLine = false;
        continue;
      }
      
      // Inside comments
      if (inJsDoc || inMultiLine) {
        violations.push({ type: inJsDoc ? 'jsdoc' : 'multiline', line: lineNum, content: line });
        continue;
      }
      
      // Single-line comments
      if (line.startsWith('//')) {
        violations.push({ type: 'inline', line: lineNum, content: line });
      }
    }
    
    return violations;
  } catch (error) {
    return [];
  }
}

function analyzeReactPatterns(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasReactImport = content.includes('import React') || content.includes('import * as React');
    const hasUseCallback = content.includes('useCallback');
    const hasUseMemo = content.includes('useMemo');
    const hasUseEffect = content.includes('useEffect');
    const hasHooks = /use[A-Z]/.test(content);
    
    const issues = [];
    
    // Check for React import when using React types
    if (content.includes('React.') && !hasReactImport) {
      issues.push('Missing React import for React.* usage');
    }
    
    // Check for hook usage patterns
    if (hasHooks && !hasUseCallback && content.includes('const handle')) {
      issues.push('Event handlers should use useCallback');
    }
    
    if (hasHooks && !hasUseMemo && content.includes('const filtered')) {
      issues.push('Filtered/computed values should use useMemo');
    }
    
    return {
      hasReactImport,
      hasUseCallback,
      hasUseMemo,
      hasUseEffect,
      hasHooks,
      issues
    };
  } catch (error) {
    return { hasReactImport: false, hasUseCallback: false, hasUseMemo: false, hasUseEffect: false, hasHooks: false, issues: [] };
  }
}

function analyzeConsoleErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const violations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for console.error and console.warn patterns
      const consoleErrorMatch = line.match(/console\.(error|warn)\s*\(/);
      if (consoleErrorMatch) {
        const method = consoleErrorMatch[1];
        violations.push({
          line: lineNum,
          method: method,
          content: line.trim(),
          guidance: `Replace console.${method} with proper error throwing. Use 'throw new Error(message)' instead of logging and continuing execution.`
        });
      }
    }
    
    return {
      violations,
      count: violations.length,
      status: violations.length === 0 ? 'PASS' : 'FAIL'
    };
  } catch (error) {
    return {
      violations: [],
      count: 0,
      status: 'PASS'
    };
  }
}

function runEslint(filePath) {
  try {
    execSync(`npx eslint "${filePath}" --max-warnings=0 --no-ignore`, { stdio: 'pipe' });
    return { errors: [], warnings: [] };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errors = [];
    const warnings = [];
    
    output.split('\n').forEach(line => {
      if (line.includes('File ignored because of a matching ignore pattern')) {
        return; // ignore this non-actionable message
      }
      if (line.includes('error')) {
        const match = line.match(/(\d+):(\d+)\s+error\s+(.+)/);
        if (match) {
          errors.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            message: match[3].trim()
          });
        }
      } else if (line.includes('warning')) {
        const match = line.match(/(\d+):(\d+)\s+warning\s+(.+)/);
        if (match) {
          warnings.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            message: match[3].trim()
          });
        }
      }
    });
    
    return { errors, warnings };
  }
}

// Run TypeScript compiler (project-wide) and collect diagnostics
function runTsc(tsconfigPathArg) {
  const byFile = {};
  let totalErrors = 0;
  const defaultTsconfig = path.join(ROOT_DIR, 'tsconfig.json');
  const tsconfigPathUsed = tsconfigPathArg || defaultTsconfig;
  const cmd = fs.existsSync(tsconfigPathUsed)
    ? `npx tsc --noEmit --pretty false -p "${tsconfigPathUsed.replace(/"/g, '\\"')}"`
    : 'npx tsc --noEmit --pretty false';
  try {
    // Success: no compiler errors
    execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' });
    return { byFile, totalErrors, tsconfigPath: tsconfigPathUsed };
  } catch (error) {
    const out = (error && (error.stdout?.toString() || error.stderr?.toString())) || '';
    const lines = out.split(/\r?\n/);
    const add = (fileKey, item) => {
      if (!byFile[fileKey]) byFile[fileKey] = [];
      byFile[fileKey].push(item);
      totalErrors++;
    };
    for (const raw of lines) {
      const line = String(raw || '').trim();
      if (!line || !/error\s+TS\d+/i.test(line)) continue;
      // Pattern 1: C:\\path\\file.ts(12,34): error TS1234: Message
      let m = line.match(/^(.*\.(?:ts|tsx))\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)$/i);
      if (m) {
        const fileRaw = m[1];
        const fileAbs = path.isAbsolute(fileRaw) ? fileRaw : path.join(ROOT_DIR, fileRaw);
        const fileKey = toRepoRelative(fileAbs);
        add(fileKey, { line: parseInt(m[2], 10), column: parseInt(m[3], 10), code: `TS${m[4]}`, message: m[5] });
        continue;
      }
      // Pattern 2: C:\\path\\file.ts:12:34 - error TS1234: Message
      m = line.match(/^(.*\.(?:ts|tsx)):(\d+):(\d+)\s*-\s*error\s+TS(\d+):\s*(.+)$/i);
      if (m) {
        const fileRaw = m[1];
        const fileAbs = path.isAbsolute(fileRaw) ? fileRaw : path.join(ROOT_DIR, fileRaw);
        const fileKey = toRepoRelative(fileAbs);
        add(fileKey, { line: parseInt(m[2], 10), column: parseInt(m[3], 10), code: `TS${m[4]}`, message: m[5] });
        continue;
      }
      // Pattern 3: Global error without file path: error TS1234: Message
      m = line.match(/^error\s+TS(\d+):\s*(.+)$/i);
      if (m) {
        add('__global__', { line: 0, column: 0, code: `TS${m[1]}`, message: m[2] });
        continue;
      }
      // Fallback: unparsed line, still count to avoid false PASS
      add('__global__', { line: 0, column: 0, code: 'UNKNOWN', message: line });
    }
    return { byFile, totalErrors, tsconfigPath: tsconfigPathUsed, raw: out };
  }
}

// Run Knip repo-wide to detect dead code & related issues
function runKnip() {
  try {
    const output = execSync('npx knip --reporter json --no-progress', {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    }).toString();
    return JSON.parse(output);
  } catch (error) {
    const out = (error && (error.stdout?.toString() || error.stderr?.toString())) || '';
    try {
      return JSON.parse(out);
    } catch (e) {
      return { error: `Failed to run knip: ${error.message}`, raw: out };
    }
  }
}

// Run jscpd repo-wide using the Node API and capture JSON in-memory (no files)
function runJscpd(outputDir, apiOpts = {}) {
  // Use a temporary script to call the ESM/CJS jscpd API and print JSON to stdout
  const tmpDir = outputDir;
  try {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  } catch (_) {}

  const tmpScript = path.join(tmpDir, 'inline-jscpd.js');
  const includeRoots = Array.isArray(apiOpts.includeRoots) && apiOpts.includeRoots.length > 0
    ? apiOpts.includeRoots
    : ["app", "components", "lib", "hooks", "types"]; // default project roots only
  const minTokens = typeof apiOpts.minTokens === 'number' && !Number.isNaN(apiOpts.minTokens)
    ? apiOpts.minTokens
    : 50; // default threshold
  const scriptSource = [
    "const { detectClones } = require('jscpd');",
    '(async () => {',
    `  const includeRoots = ${JSON.stringify(includeRoots)};`,
    `  const minTokens = ${JSON.stringify(minTokens)};`,
    '  const opts = {',
    '    path: includeRoots && includeRoots.length ? includeRoots : ["." ],',
    '    pattern: "**/*.{ts,tsx,js}",',
    '    format: "typescript,tsx,javascript",',
    '    ignore: ["**/{.next,node_modules,dist,build}/**"],',
    '    minTokens: minTokens,',
    '    absolute: true,',
    '    gitignore: false,',
    '    silent: true,',
    '    reporters: ["silent"]',
    '  };',
    '  const files = require("@jscpd/finder").getFilesToDetect(opts);',
    '  const debug = { filesCount: Array.isArray(files) ? files.length : 0, samplePaths: (Array.isArray(files) ? files.slice(0,5).map(f => f.path) : []), includeRoots, minTokens };',
    '  const hc = { log: console.log, info: console.info, warn: console.warn };',
    '  let clones;',
    '  try {',
    '    console.log = () => {};',
    '    console.info = () => {};',
    '    console.warn = () => {};',
    '    clones = await detectClones(opts);',
    '  } finally {',
    '    console.log = hc.log;',
    '    console.info = hc.info;',
    '    console.warn = hc.warn;',
    '  }',
    '  debug.clonesShape = { isArray: Array.isArray(clones), type: typeof clones, keys: clones && Object.keys(clones) };',
    '  const safeNum = (v) => typeof v === "number" ? v : 0;',
    '  const raw = Array.isArray(clones) ? clones : ((clones && (clones.clones || clones.duplicates)) || []);',
    '  const dups = (Array.isArray(raw) ? raw : []).map(c => {',
    '    const a = c.duplicationA || {};',
    '    const b = c.duplicationB || {};',
    '    const aStart = a.start || {};',
    '    const aEnd = a.end || {};',
    '    const bStart = b.start || {};',
    '    const bEnd = b.end || {};',
    '    const lines = safeNum((safeNum(aEnd.line) - safeNum(aStart.line)) + 1);',
    '    return {',
    '      firstFile: { name: a.sourceId || "", start: safeNum(aStart.line), end: safeNum(aEnd.line) },',
    '      secondFile: { name: b.sourceId || "", start: safeNum(bStart.line), end: safeNum(bEnd.line) },',
    '      lines,',
    '      tokens: 0',
    '    };',
    '  }).filter(d => d.firstFile.name && d.secondFile.name && d.lines > 0);',
    '  const stats = {',
    '    total: {',
    '      clones: dups.length,',
    '      duplicatedLines: dups.reduce((a, c) => a + (c.lines || 0), 0),',
    '      percentage: 0',
    '    }',
    '  };',
    '  const result = { duplicates: dups, statistics: stats, debug };',
    '  console.log(JSON.stringify(result));',
    '})().catch(err => {',
    '  console.error(JSON.stringify({ error: String(err && err.message || err) }));',
    '  process.exit(1);',
    '});'
  ].join('\n');

  try {
    fs.writeFileSync(tmpScript, scriptSource, 'utf8');
    const out = execSync(`node "${tmpScript}"`, { cwd: ROOT_DIR, stdio: 'pipe' }).toString();
    try {
      return JSON.parse(out);
    } catch (parseErr) {
      return { error: `Failed to parse jscpd API output: ${parseErr.message}`, raw: out };
    }
  } catch (error) {
    const raw = error && (error.stdout?.toString() || error.stderr?.toString()) || '';
    try {
      return JSON.parse(raw);
    } catch (_) {
      return { error: `Failed to run jscpd API: ${error.message}`, raw };
    }
  } finally {
    try { if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript); } catch (_) {}
  }
}

// Merge Knip results into per-file results and compute repo-wide summary
function applyKnipToResults(results, knipData) {
  const byFile = new Map();
  for (const r of results) {
    byFile.set(toRepoRelative(r.filePath), r);
  }

  const summary = {
    unusedFiles: Array.isArray(knipData?.files) ? knipData.files.length : 0,
    unusedExports: 0,
    unusedTypes: 0,
    unusedEnumMembers: 0,
    unusedClassMembers: 0,
    unlistedDependencies: 0,
    unresolvedImports: 0
  };

  const issues = Array.isArray(knipData?.issues) ? knipData.issues : [];
  for (const item of issues) {
    const fileKey = toRepoRelative(item.file || '');
    const counts = {
      unusedExports: Array.isArray(item.exports) ? item.exports.length : 0,
      unusedTypes: Array.isArray(item.types) ? item.types.length : 0,
      unusedEnumMembers: item.enumMembers ? Object.values(item.enumMembers).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0) : 0,
      unusedClassMembers: item.classMembers ? Object.values(item.classMembers).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0) : 0,
      unlistedDependencies: Array.isArray(item.unlisted) ? item.unlisted.length : 0,
      unresolvedImports: Array.isArray(item.unresolved) ? item.unresolved.length : 0
    };

    // Update summary totals
    summary.unusedExports += counts.unusedExports;
    summary.unusedTypes += counts.unusedTypes;
    summary.unusedEnumMembers += counts.unusedEnumMembers;
    summary.unusedClassMembers += counts.unusedClassMembers;
    summary.unlistedDependencies += counts.unlistedDependencies;
    summary.unresolvedImports += counts.unresolvedImports;

    // Attach to matching analyzed file (if present among args)
    const r = byFile.get(fileKey);
    if (r) {
      const any = Object.values(counts).some(v => v > 0);
      const recs = [];
      if (counts.unusedExports > 0) recs.push('Remove unused export(s) or their references.');
      if (counts.unusedTypes > 0) recs.push('Remove unused type(s) or inline where needed.');
      if (counts.unusedEnumMembers > 0) recs.push('Remove unused enum member(s).');
      if (counts.unusedClassMembers > 0) recs.push('Remove unused class member(s).');
      if (counts.unlistedDependencies > 0) recs.push('Remove unlisted dependency usage or add to package.json appropriately.');
      if (counts.unresolvedImports > 0) recs.push('Fix unresolved import(s): verify path/alias/tsconfig paths.');
      r.deadCode = { ...counts, status: any ? 'FAIL' : 'PASS', recommendations: recs };
    }
  }

  // If a file analyzed has no knip entry, mark as PASS with zeros
  for (const r of results) {
    if (!r.deadCode) {
      r.deadCode = {
        unusedExports: 0,
        unusedTypes: 0,
        unusedEnumMembers: 0,
        unusedClassMembers: 0,
        unlistedDependencies: 0,
        unresolvedImports: 0,
        status: 'PASS',
        recommendations: []
      };
    }
  }

  return { summary };
}

// Merge jscpd results into per-file results and compute repo-wide summary
function applyJscpdToResults(results, jscpdData) {
  const segmentsByFile = new Map();
  const dups = Array.isArray(jscpdData?.duplicates) ? jscpdData.duplicates : [];

  function pushSegment(fileRel, seg) {
    if (!segmentsByFile.has(fileRel)) segmentsByFile.set(fileRel, []);
    segmentsByFile.get(fileRel).push(seg);
  }

  for (const dup of dups) {
    const first = dup.firstFile || {};
    const second = dup.secondFile || {};
    const firstRel = toRepoRelative(first.name || '');
    const secondRel = toRepoRelative(second.name || '');
    const lines = typeof dup.lines === 'number' ? dup.lines : (first.end - first.start + 1 || 0);
    const tokens = typeof dup.tokens === 'number' ? dup.tokens : 0;

    pushSegment(firstRel, {
      otherFile: secondRel,
      lines,
      tokens,
      startLine: first.start,
      endLine: first.end,
      otherStartLine: second.start,
      otherEndLine: second.end
    });

    pushSegment(secondRel, {
      otherFile: firstRel,
      lines,
      tokens,
      startLine: second.start,
      endLine: second.end,
      otherStartLine: first.start,
      otherEndLine: first.end
    });
  }

  for (const r of results) {
    const key = toRepoRelative(r.filePath);
    const segs = segmentsByFile.get(key) || [];
    r.duplicates = {
      count: segs.length,
      segments: segs,
      status: segs.length > 0 ? 'FAIL' : 'PASS',
      recommendations: segs.length > 0 ? ['Extract shared logic into a utility/component to remove duplication.'] : []
    };
  }

  // Support both shapes: statistics.total (preferred) and statistic.total (older)
  const totalStats = (jscpdData && (jscpdData.statistics?.total || jscpdData.statistic?.total)) || {};
  const summary = {
    groups: totalStats.clones || 0,
    duplicatedLines: totalStats.duplicatedLines || 0,
    percentage: totalStats.percentage || 0
  };
  return { summary };
}

function analyzeTypeScript(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split('\n');
    
    // Extract function-like constructs with metadata (name, line, kind, wrapper)
    function extractFunctions(lines) {
      const functions = [];
      for (let i = 0; i < lines.length; i++) {
        const firstLine = lines[i];
        let name = '';
        let kind = '';
        let wrapperName = null;
        
        const fnDeclMatch = firstLine.match(/(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/);
        const constMatch = firstLine.match(/(?:export\s+)?const\s+(\w+)\s*=\s*/);
        
        if (!fnDeclMatch && !constMatch) continue;
        
        if (fnDeclMatch) {
          name = fnDeclMatch[1];
          kind = 'function-declaration';
        } else if (constMatch) {
          name = constMatch[1];
          kind = 'const';
        }
        
        let text = firstLine;
        let j = i + 1;
        let parenLevel = 0;
        let seenArrow = /=>/.test(firstLine);
        let foundBrace = false;
        let everSawParen = false;
        
        function scan(s) {
          for (let ch of s) {
            if (ch === '(') { parenLevel++; everSawParen = true; }
            else if (ch === ')') { parenLevel = Math.max(0, parenLevel - 1); }
            else if (ch === '{' && parenLevel === 0) { foundBrace = true; break; }
          }
          if (/=>/.test(s)) seenArrow = true;
        }
        
        scan(firstLine);
        // Capture header lines conservatively.
        if (kind === 'const') {
          // For const assignments, only scan ahead while inside parentheses or to catch an immediate multi-line parameter start.
          while (!foundBrace && j < lines.length && (parenLevel > 0 || (!seenArrow && !everSawParen && (j - i) < 3))) {
            text += '\n' + lines[j];
            scan(lines[j]);
            j++;
          }
          // Do not greedily read more lines for consts; avoid inheriting arrows from later unrelated lines.
        } else {
          // For function declarations, allow scanning until we see the body start or the arrow.
          while (!foundBrace && j < lines.length && (parenLevel > 0 || !seenArrow)) {
            text += '\n' + lines[j];
            scan(lines[j]);
            j++;
          }
          // Read a few more lines to include the '{' if it appears shortly
          while (!foundBrace && j < lines.length && j - i < 8) {
            text += '\n' + lines[j];
            scan(lines[j]);
            j++;
          }
        }
        
        // Determine wrapper name (if any) for const assignments
        if (kind === 'const') {
          const wrapperMatch = text.match(/=\s*([A-Za-z_$][\w$]*)\s*(?:<|\()/);
          if (wrapperMatch) {
            wrapperName = wrapperMatch[1];
            // Distinguish between direct arrow and wrapped
            if (/=\s*\(/.test(text)) {
              kind = 'const-arrow';
            } else {
              kind = 'wrapped-arrow';
            }
          } else {
            kind = 'const-arrow';
          }
        }
        
        // Only keep const assignments that are function-like
        if (kind !== 'function-declaration') {
          const isArrow = /=\s*(?:async\s+)?[\s\S]*?\)\s*=>/.test(text);
          const isFunctionKeyword = /function\s*\(/.test(text);
          const isTypedFunctionVar = /const\s+\w+\s*:\s*[^=]*=>/.test(text);
          // Wrapper call where the first argument is an arrow (optionally typed): wrapper((args): Type => ...)
          const isWrapperWithArrowArg = /=\s*[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*\(\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^)]+)?\s*=>/.test(text);
          const functionLike = isArrow || isFunctionKeyword || isTypedFunctionVar || isWrapperWithArrowArg;
          if (!functionLike) {
            continue; // skip non-function consts (e.g., useRouter(), strings, numbers, objects)
          }
        }
        
        const signaturePreview = text.split('\n')[0].trim();
        
        functions.push({
          text,
          startLine: i + 1,
          name: name || '(anonymous)',
          kind,
          wrapperName,
          signaturePreview,
        });
      }
      return functions;
    }
    
    const functions = extractFunctions(lines);
    const missingDetails = [];
    
    function hasExplicitReturnType(func) {
      const clean = func.text.replace(/\s+/g, ' ').trim();
      
      function headerBeforeBody(text) {
        let paren = 0;
        for (let idx = 0; idx < text.length; idx++) {
          const ch = text[idx];
          if (ch === '(') paren++;
          else if (ch === ')') paren = Math.max(0, paren - 1);
          else if (ch === '{' && paren === 0) {
            return text.slice(0, idx);
          }
        }
        return text;
      }
      
      // Prefer a structural check on function declarations: any return type token after ) and before body {
      if (func.kind === 'function-declaration') {
        const header = headerBeforeBody(func.text).replace(/\s+/g, ' ');
        if (/\)\s*:\s*\S/.test(header)) {
          return true;
        }
      }
      
      // 1) function declaration annotated: function name(args): Type {
      if (/function\s+\w+\s*\([^)]*\)\s*:\s*[^\{]+\{/.test(clean)) {
        return true;
      }
      
      // 2) variable type annotation: const x: (args) => Type = (...)
      if (/const\s+\w+\s*:\s*[^=]+=\s*/.test(clean)) {
        return true;
      }
      
      // 3) direct arrow annotation: = (args): Type => (across multiline/nested parens)
      if (/=\s*(?:async\s+)?[\s\S]*?\)\s*:\s*[^=]+=>/.test(clean)) {
        return true;
      }
      
      // 4) wrapper generic annotation: = useCallback<(args) => Type>(...)
      if (func.kind === 'wrapped-arrow' && func.wrapperName === 'useCallback') {
        const m = clean.match(/=\s*useCallback\s*<([^>]+)>/);
        if (m && /\([^)]*\)\s*=>\s*[^)]+/.test(m[1])) {
          return true;
        }
      }

      // 4.5) any wrapper call with explicit arrow return type in its argument: = wrapper((args): Type => ...)
      if (/=\s*[A-Za-z_$][\w$]*\s*(?:<[^>]+>)?\s*\(\s*(?:async\s+)?\([^)]*\)\s*:\s*[^)]+=>/.test(clean)) {
        return true;
      }
      
      return false;
    }
    
    functions.forEach(func => {
      const clean = func.text.replace(/\s+/g, ' ').trim();
      
      const shouldSkip = 
        clean.includes('constructor') ||
        clean.includes('set ') ||
        clean.includes('get ') ||
        /function\s+\w+\s*\(\)\s*\{/.test(clean) ||
        clean.includes('(): void') ||
        clean.includes(': void') ||
        clean.includes('Promise<void>');
      
      if (shouldSkip) return;
      
      if (!hasExplicitReturnType(func)) {
        missingDetails.push({
          name: func.name,
          line: func.startLine,
          kind: func.kind,
          signaturePreview: func.signaturePreview,
        });
      }
    });
    
    return {
      totalFunctions: functions.length,
      missingReturnTypes: missingDetails.length,
      hasExplicitTypes: missingDetails.length === 0,
      status: missingDetails.length === 0 ? 'PASS' : 'FAIL',
      details: missingDetails,
    };
  } catch (error) {
    return { totalFunctions: 0, missingReturnTypes: 0, hasExplicitTypes: true, status: 'PASS', details: [] };
  }
}

// Helper functions to identify legitimate patterns vs fallback violations
function isValidBooleanLogic(line) {
  // Boolean logic operations (not fallback data)
  return /\|\|\s*(true|false|\w+\.\w+|\w+\(\)|\w+)\s*$/.test(line) ||
         /const\s+\w+\s*=\s*\w+\s*\|\|\s*\w+/.test(line);
}

function isValidHtmlAttribute(line) {
  // HTML attributes: disabled={condition ? true : false}
  return /(disabled|checked|selected|required|readOnly|autoFocus)\s*=\s*\{.*?\?.*?:.*?(true|false|undefined)\s*\}/.test(line);
}

function isValidCssClass(line) {
  // CSS class selection: className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
  return /(className|class)\s*=\s*\{.*?\?\s*['`"].*?['`"]\s*:\s*['`"]/.test(line);
}

function isValidAriaAttribute(line) {
  // Aria attributes: aria-expanded={isOpen ? 'true' : 'false'}
  return /aria-\w+\s*=\s*\{.*?\?\s*['`"](true|false|menu)['`"]\s*:\s*['`"](true|false)['`"]/.test(line) ||
         /\{\.\.\.\(.*?&&.*?\{\s*['"]aria-/.test(line); // Conditional aria spreading
}

function isCommentLine(line) {
  // Comments and strings containing patterns
  return /^\s*\/\//.test(line) || /^\s*\/\*/.test(line) || /^\s*\*/.test(line);
}

// Context validation functions for fallback data analysis
function isExplicitNullableReturnType(content, lineNum) {
  // Look backwards for function signature with | null return type
  const lines = content.split('\n');
  const currentLineIndex = lineNum - 1;
  
  // Search backwards up to 10 lines for function signature
  for (let i = Math.max(0, currentLineIndex - 10); i <= currentLineIndex; i++) {
    const line = lines[i];
    // Match function signatures with explicit | null return types
    if (/:\s*[^=]*\|\s*null/.test(line) || 
        /JSX\.Element\s*\|\s*null/.test(line) ||
        /ReactNode\s*\|\s*null/.test(line)) {
      return true;
    }
  }
  return false;
}

function isReactConditionalRender(content, lineNum) {
  // Check if this is a React component with EXPLICIT null return type
  const lines = content.split('\n');
  const currentLineIndex = lineNum - 1;
  
  // Look for React imports
  const hasReactImports = content.includes('import React') || 
                         content.includes('import * as React') ||
                         content.includes('JSX.Element');
  
  if (!hasReactImports) return false;
  
  // CRITICAL: Only allow if function has EXPLICIT | null return type
  for (let i = Math.max(0, currentLineIndex - 15); i <= currentLineIndex; i++) {
    const line = lines[i];
    // Match React component patterns WITH explicit null return type
    if (/const\s+\w+\s*=\s*\([^)]*\)\s*:\s*JSX\.Element\s*\|\s*null/.test(line) ||
        /function\s+\w+\s*\([^)]*\)\s*:\s*JSX\.Element\s*\|\s*null/.test(line)) {
      return true;
    }
  }
  
  // Do NOT allow components without explicit null typing
  return false;
}

function isValidApiNotFoundPattern(content, lineNum) {
  // Check if this is a legitimate API "not found" pattern
  const lines = content.split('\n');
  const currentLineIndex = lineNum - 1;
  
  // Look for function signature that explicitly returns T | null
  for (let i = Math.max(0, currentLineIndex - 10); i <= currentLineIndex; i++) {
    const line = lines[i];
    // Match utility function patterns that legitimately return null
    if (/function\s+\w+.*?:\s*\w+\s*\|\s*null/.test(line) ||
        /export\s+function\s+\w+.*?:\s*\w+\s*\|\s*null/.test(line)) {
      return true;
    }
  }
  
  // Check for legitimate "not found" contexts (expand context window)
  const contextLines = lines.slice(Math.max(0, currentLineIndex - 5), currentLineIndex + 1).join(' ');
  
  // localStorage, cache, data loading, or expiration scenarios
  if (/localStorage\.getItem|cache\.get|stored|expired/.test(contextLines) ||
      /if\s*\(!\w+\)|if\s*\(.*expired.*\)|Date\.now\(\).*>.*maxAge/.test(contextLines) ||
      /deleteDraft|removeItem|clear/.test(contextLines)) {
    return true;
  }
  
  // Check for data validation patterns
  if (/if\s*\([^)]*\)\s*{[^}]*return\s+null/.test(contextLines)) {
    return true;
  }
  
  return false;
}

function analyzeFallbackData(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const trimmedLine = line.trim();
      
      // Pattern 1: Return null/undefined (with context validation)
      if (/return\s+(null|undefined);?$/.test(trimmedLine)) {
        // Skip if this is a legitimate null return pattern
        if (isExplicitNullableReturnType(content, lineNum) ||
            isReactConditionalRender(content, lineNum) ||
            isValidApiNotFoundPattern(content, lineNum)) {
          // This is a legitimate null return, not a fallback violation
          continue;
        }
        
        violations.push({
          type: 'return_null',
          line: lineNum,
          content: trimmedLine,
          advice: 'Throw composed error instead of null return. Null returns mask invalid states and prevent proper error handling. Consider: What upstream validation failed? Why is this data missing?'
        });
      }
      
      // Pattern 2: Logical OR fallbacks with literals (exclude boolean logic)
      const orFallbackMatch = /\|\|\s*(['"`].*?['"`]|\[.*?\]|\{.*?\})/.exec(trimmedLine);
      if (orFallbackMatch && 
          !isValidBooleanLogic(trimmedLine) && 
          !isCommentLine(trimmedLine)) {
        violations.push({
          type: 'or_fallback',
          line: lineNum,
          content: trimmedLine,
          advice: 'Throw composed error instead of silent fallback. This pattern hides missing required data. Recommend deeper analysis: Is this data truly optional, or should upstream validation catch this?'
        });
      }
      
      // Pattern 3: Optional chaining with fallbacks  
      if (/\?\.\w+.*?\|\|/.test(trimmedLine)) {
        violations.push({
          type: 'optional_chaining_fallback',
          line: lineNum,
          content: trimmedLine,
          advice: 'Throw composed error instead of defensive fallback. Optional chaining with fallbacks suggests unclear data contracts. Recommend deeper analysis: Should this property be guaranteed? Is validation missing?'
        });
      }
      
      // Pattern 4: Ternary with default values (exclude HTML attributes and CSS classes)
      const ternaryFallbackMatch = /\?\s*\w+\s*:\s*(['"`].*?['"`]|\[.*?\]|\{.*?\})/.exec(trimmedLine);
      if (ternaryFallbackMatch && 
          !isValidHtmlAttribute(trimmedLine) && 
          !isValidCssClass(trimmedLine) && 
          !isValidAriaAttribute(trimmedLine) &&
          !isCommentLine(trimmedLine)) {
        violations.push({
          type: 'ternary_fallback',
          line: lineNum,
          content: trimmedLine,
          advice: 'Throw composed error instead of default value. Ternary fallbacks mask validation failures. Consider: What makes this condition invalid? Should upstream code prevent this state?'
        });
      }
      
      // Pattern 5: Empty catch blocks with returns (multi-line detection)
      if (trimmedLine.includes('catch')) {
        // Look ahead for empty catch blocks with returns
        let catchContent = '';
        let j = i;
        let braceCount = 0;
        let inCatch = false;
        
        while (j < lines.length) {
          const currentLine = lines[j].trim();
          if (currentLine.includes('catch')) inCatch = true;
          if (inCatch) {
            catchContent += currentLine + ' ';
            braceCount += (currentLine.match(/\{/g) || []).length;
            braceCount -= (currentLine.match(/\}/g) || []).length;
            if (braceCount === 0 && inCatch) break;
          }
          j++;
        }
        
        if (/catch\s*\([^)]*\)\s*\{[^}]*return\s+[^;]+;?\s*\}/.test(catchContent.replace(/\s+/g, ' '))) {
          violations.push({
            type: 'empty_catch_return',
            line: lineNum,
            content: trimmedLine,
            advice: 'Throw composed error instead of swallowing exceptions. Silent error suppression violates fail-fast methodology. Consider: Should this error propagate up? What context should be preserved?'
          });
        }
      }
    }
    
    return {
      violations,
      count: violations.length,
      status: violations.length === 0 ? 'PASS' : 'FAIL'
    };
  } catch (error) {
    return {
      violations: [],
      count: 0,
      status: 'PASS'
    };
  }
}

function analyzeFile(filePath) {
  // Skip all analysis for non-TypeScript files - analyzer processes TypeScript files only
  if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
    return {
      filePath,
      size: { lines: 0, limit: 0, type: 'skipped', status: 'PASS', percentage: 0 },
      comments: { violations: [], count: 0, status: 'PASS' },
      react: { issues: [] },
      consoleErrors: { violations: [], count: 0, status: 'PASS' },
      eslint: { errors: [], warnings: [] },
      typescript: { totalFunctions: 0, missingReturnTypes: 0, hasExplicitTypes: true, status: 'PASS' },
      fallbackData: { violations: [], count: 0, status: 'PASS' }
    };
  }
  
  const fileType = getFileType(filePath);
  const lines = countLines(filePath);
  const limit = FILE_SIZE_LIMITS[fileType];
  
  const sizeAnalysis = {
    lines,
    limit,
    type: fileType,
    status: lines <= limit ? 'PASS' : 'FAIL',
    percentage: Math.round((lines / limit) * 100)
  };
  
  const commentViolations = analyzeComments(filePath);
  const commentAnalysis = {
    violations: commentViolations,
    count: commentViolations.length,
    status: commentViolations.length === 0 ? 'PASS' : 'FAIL'
  };
  
  const reactAnalysis = analyzeReactPatterns(filePath);
  const consoleErrorAnalysis = analyzeConsoleErrors(filePath);
  const eslintAnalysis = runEslint(filePath);
  const typeScriptAnalysis = analyzeTypeScript(filePath);
  const fallbackDataAnalysis = analyzeFallbackData(filePath);
  
  return {
    filePath,
    size: sizeAnalysis,
    comments: commentAnalysis,
    react: reactAnalysis,
    consoleErrors: consoleErrorAnalysis,
    eslint: eslintAnalysis,
    typescript: typeScriptAnalysis,
    fallbackData: fallbackDataAnalysis
  };
}

function generateCompactSummary(results) {
  const totalFiles = results.length;
  const failedFiles = results.filter(r => 
    r.eslint.errors.length > 0 || r.eslint.warnings.length > 0 || 
    r.comments.status === 'FAIL' || 
    r.size.status === 'FAIL' || 
    r.typescript.status === 'FAIL' ||
    (r.typescriptCompiler && r.typescriptCompiler.status === 'FAIL') ||
    r.consoleErrors.status === 'FAIL' ||
    r.fallbackData.status === 'FAIL' ||
    (r.deadCode && r.deadCode.status === 'FAIL') ||
    (r.duplicates && r.duplicates.status === 'FAIL')
  );
  const passingFiles = totalFiles - failedFiles.length;
  
  let summary = `CODE REVIEW: ${totalFiles} files | ${passingFiles} passed | ${failedFiles.length} failed\n`;
  summary += `\n`;
  
  // All violations are blocking and must be fixed
  if (failedFiles.length > 0) {
    summary += `VIOLATIONS (blocking):\n`;
    
    failedFiles.forEach(file => {
      const fileName = path.basename(file.filePath);

      
      // File size violations  
      if (file.size.status === 'FAIL') {
        const fileType = getFileType(file.filePath);
        const limit = FILE_SIZE_LIMITS[fileType];
        summary += `${fileName}: File too large (${file.size.lines}/${limit}) - split into modules\n`;
      }
      
      // Comment violations
      if (file.comments.status === 'FAIL') {
        summary += `${fileName}: Remove ${file.comments.count} comments\n`;
      }
      
      // TypeScript violations
      if (file.typescript.status === 'FAIL') {
        summary += `${fileName}: Add ${file.typescript.missingReturnTypes} return types\n`;
        const details = file.typescript.details || [];
        details.forEach(d => {
          const fnName = d.name || '(anonymous)';
          summary += `${fileName}:${d.line} - Add return type to "${fnName}"\n`;
        });
      }
      // TypeScript compiler diagnostics
      if (file.typescriptCompiler && file.typescriptCompiler.errorCount > 0) {
        const count = file.typescriptCompiler.errorCount;
        summary += `${fileName}: ${count} TypeScript compiler error(s)\n`;
        const list = Array.isArray(file.typescriptCompiler.errors) ? file.typescriptCompiler.errors.slice(0, 5) : [];
        list.forEach(e => {
          const code = e.code || 'TS';
          const line = typeof e.line === 'number' ? e.line : 0;
          const col = typeof e.column === 'number' ? e.column : 0;
          const msg = (e.message || '').trim();
          summary += `${fileName}:${line}:${col} - ${code}: ${msg}\n`;
        });
        if ((file.typescriptCompiler.errors || []).length > 5) {
          summary += `${fileName}: ...and more\n`;
        }
      }
      
      // Console error violations (blocking - violates fail-fast principle)
      if (file.consoleErrors.status === 'FAIL') {
        file.consoleErrors.violations.forEach(violation => {
          summary += `${fileName}:${violation.line} - FAIL-FAST VIOLATION: Replace console.${violation.method} with throw new Error()\n`;
        });
      }
      
      // Fallback data violations (blocking - violates fail-fast principle)
      if (file.fallbackData.status === 'FAIL') {
        file.fallbackData.violations.forEach(violation => {
          summary += `${fileName}:${violation.line} - FALLBACK DATA VIOLATION: ${violation.advice}\n`;
        });
      }
      
      // Dead code / unresolved imports (Knip)
      if (file.deadCode && file.deadCode.status === 'FAIL') {
        summary += `${fileName}: Dead code/unresolved imports detected\n`;
      }
      
      // Duplicate code (jscpd)
      if (file.duplicates && file.duplicates.status === 'FAIL') {
        summary += `${fileName}: Duplicate code segments (${file.duplicates.count})\n`;
      }
      
      // ESLint violations (all blocking)
      const allViolations = [...file.eslint.errors, ...file.eslint.warnings];
      if (allViolations.length > 0) {
        allViolations.forEach(violation => {
          // Terse message for common violations
          let message = violation.message;
          if (message.includes('Unexpected any')) {
            message = 'Replace any type';
          } else if (message.includes('Missing semicolon')) {
            message = 'Add semicolon';
          } else if (message.includes('Unused variable')) {
            message = 'Remove unused variable';
          }
          summary += `${fileName}:${violation.line} - ${message}\n`;
        });
      }
      
    });
    summary += `\nACTION REQUIRED: Fix all violations above.\n`;
  } else {
    summary += `✅ All files passed code review standards.\n`;
  }
  
  return summary;
}

function generateBatchSummary(results) {
  const totalFiles = results.length;
  const passedFiles = results.filter(r => r.comments.status === 'PASS' && r.size.status === 'PASS' && r.typescript.status === 'PASS' && (!r.typescriptCompiler || r.typescriptCompiler.status === 'PASS') && r.eslint.errors.length === 0 && r.consoleErrors.status === 'PASS' && r.fallbackData.status === 'PASS' && (!r.deadCode || r.deadCode.status === 'PASS') && (!r.duplicates || r.duplicates.status === 'PASS'));
  const failedFiles = results.filter(r => r.comments.status === 'FAIL' || r.size.status === 'FAIL' || r.typescript.status === 'FAIL' || (r.typescriptCompiler && r.typescriptCompiler.status === 'FAIL') || r.eslint.errors.length > 0 || r.consoleErrors.status === 'FAIL' || r.fallbackData.status === 'FAIL' || (r.deadCode && r.deadCode.status === 'FAIL') || (r.duplicates && r.duplicates.status === 'FAIL'));
  
  let summary = `=== BATCH TEST SUMMARY ===\n`;
  summary += `Total Files: ${totalFiles} | Passed: ${passedFiles.length} | Failed: ${failedFiles.length}\n\n`;
  
  if (failedFiles.length > 0) {
    summary += `⚠️  FAILED FILES - ALL VIOLATIONS MUST BE FIXED:\n`;
    failedFiles.forEach(file => {
      const fileName = path.basename(file.filePath);
      const issues = [];
      if (file.comments.status === 'FAIL') issues.push('comments');
      if (file.size.status === 'FAIL') issues.push('size');
      if (file.typescript.status === 'FAIL') issues.push(`typescript (${file.typescript.missingReturnTypes} missing)`);
      if (file.typescriptCompiler && file.typescriptCompiler.status === 'FAIL') issues.push(`tsc (${file.typescriptCompiler.errorCount})`);
      if (file.consoleErrors.status === 'FAIL') issues.push(`console-errors (${file.consoleErrors.count} fail-fast violations)`);
      if (file.fallbackData.status === 'FAIL') issues.push(`fallback-data (${file.fallbackData.count} violations)`);
      if (file.eslint.errors.length > 0) issues.push(`eslint (${file.eslint.errors.length} errors)`);
      if (file.deadCode && file.deadCode.status === 'FAIL') issues.push('dead-code');
      if (file.duplicates && file.duplicates.status === 'FAIL') issues.push(`duplicates (${file.duplicates.count})`);
      summary += `- ${fileName}: ${issues.join(', ')}\n`;
    });
    summary += `\n`;
    summary += `🔧 ACTION REQUIRED: Every failed file must be corrected.\n`;
    summary += `   No violations are acceptable - fix all issues above.\n`;
    summary += `\n`;
  }
  
  if (passedFiles.length > 0) {
    summary += `✅ PASSED FILES:\n`;
    passedFiles.forEach(file => {
      const fileName = path.basename(file.filePath);
      summary += `- ${fileName}: All checks passed\n`;
    });
    summary += `\n`;
  }
  
  return summary;
}

function main() {
  const args = process.argv.slice(2);
  
  // Help flags
  if (args.includes('--help') || args.includes('-h')) {
    const usage = [
      'Usage: node code-review-analyzer.js <file1> [file2 ...]',
      '',
      'Description:',
      '  Analyzes TypeScript/TSX files for:',
      '  - File size limits by directory type',
      '  - Disallowed comments (inline, JSDoc, multi-line)',
      '  - React usage patterns',
      '  - console.error/console.warn fail-fast violations',
      '  - ESLint errors/warnings (via npx eslint)',
      '  - TypeScript compiler diagnostics (via npx tsc --noEmit)',
      '  - Fallback data anti-patterns (null/undefined returns, || defaults, etc.)',
      '  - Dead code & unresolved imports (via knip, repo-wide)',
      '  - Duplicate code detection (via jscpd, repo-wide, default min-tokens=50)',
      '',
      'Flags:',
      '  --jscpd-min-tokens <n>   Set the JSCPD min tokens threshold (default 50)',
      '  --jscpd-include <dirs>   Comma-separated include roots to scan (default "app,components,lib,hooks,types").',
      '                           Use "." to scan entire repo or include "docs" to scan test fixtures.',
      '  --porcelain               Auto-select changed TypeScript files via `git status --porcelain -z`',
      '  --no-autofix              Disable default auto-fix of comments/console lines',
      '  --debug                   Print extra debug info (e.g., JSCPD scan details)',
      '  --report-all              Include all files in JSON report (default: only files with violations)',
      '  --tsconfig <path>         Use a specific tsconfig.json (default: repo root tsconfig.json)',
      '  --skip-tsc                Skip TypeScript compiler checks (not recommended)',
      '',
      'Examples:',
      '  node docs/scripts/code-review-analyzer.js app/page.tsx',
      '  node docs/scripts/code-review-analyzer.js components/Button.tsx hooks/useThing.ts',
      '  node docs/scripts/code-review-analyzer.js --porcelain',
      '  node docs/scripts/code-review-analyzer.js --porcelain --no-autofix',
      '  node docs/scripts/code-review-analyzer.js --help',
      '  node docs/scripts/code-review-analyzer.js --jscpd-min-tokens 35 --jscpd-include . app/page.tsx',
      '',
      'Output:',
      '  - Console summary (compact or batch)',
      '  - Detailed JSON report written to docs/review/output/code_review_analysis.json',
      '',
      'Exit codes:',
      '  0  All checks passed',
      '  1  One or more violations found or write error'
    ].join('\n');
    console.log(usage);
    process.exit(0);
  }
  
  // Parse arguments: separate files and JSCPD flags
  let jscpdMinTokens = undefined;
  let jscpdIncludeRoots = undefined;
  let debugMode = false;
  let reportAll = false;
  let tsconfigOverride = undefined;
  let skipTsc = false;
  let porcelainMode = false;
  let noAutofix = false;
  const files = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--jscpd-min-tokens') {
      const v = args[i + 1];
      i++;
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) jscpdMinTokens = n;
      continue;
    }
    if (a.startsWith('--jscpd-min-tokens=')) {
      const v = a.split('=')[1];
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) jscpdMinTokens = n;
      continue;
    }
    if (a === '--jscpd-include') {
      const v = args[i + 1];
      i++;
      if (typeof v === 'string') {
        jscpdIncludeRoots = v.split(',').map(s => s.trim()).filter(Boolean);
      }
      continue;
    }
    if (a.startsWith('--jscpd-include=')) {
      const v = a.split('=')[1];
      if (typeof v === 'string') {
        jscpdIncludeRoots = v.split(',').map(s => s.trim()).filter(Boolean);
      }
      continue;
    }
    if (a === '--debug') {
      debugMode = true;
      continue;
    }
    if (a === '--report-all') {
      reportAll = true;
      continue;
    }
    if (a === '--no-autofix') {
      noAutofix = true;
      continue;
    }
    if (a === '--tsconfig') {
      const v = args[i + 1];
      i++;
      if (typeof v === 'string') {
        tsconfigOverride = path.isAbsolute(v) ? v : path.join(ROOT_DIR, v);
      }
      continue;
    }
    if (a.startsWith('--tsconfig=')) {
      const v = a.split('=')[1];
      if (typeof v === 'string') {
        tsconfigOverride = path.isAbsolute(v) ? v : path.join(ROOT_DIR, v);
      }
      continue;
    }
    if (a === '--skip-tsc') {
      skipTsc = true;
      continue;
    }
    if (a === '--porcelain') {
      porcelainMode = true;
      continue;
    }
    files.push(a);
  }
  
  // If porcelain is enabled and no positional files were provided, collect from git status
  if (porcelainMode && files.length === 0) {
    const collected = collectPorcelainFiles();
    for (const f of collected) files.push(f);
    if (debugMode) {
      const rels = files.map(toRepoRelative);
      console.log(`Porcelain mode selected ${rels.length} file(s): ${rels.join(', ')}`);
    }
  }
  
  if (files.length === 0) {
    if (porcelainMode) {
      console.log('No reviewable TypeScript changes detected by git porcelain.');
      process.exit(0);
    } else {
      console.error('Usage: node code-review-analyzer.js <file1> <file2> ...');
      process.exit(1);
    }
  }

  // Check if this is a batch test (multiple files with test patterns)
  const isBatchTest = files.length > 1 && files.some(f => f.includes('test/typescript-analyzer/'));

// FAIL-SAFE: Delete stale analysis file
deleteStaleAnalysis();

// Default autofix step: remove comments and debug consoles before analyzing (unless disabled)
let autofixStats = { enabled: !noAutofix && process.env.CODE_REVIEW_NO_AUTOFIX !== '1', filesProcessed: 0, commentsRemoved: 0, consolesRemoved: 0, errors: 0 };
if (autofixStats.enabled) {
  try {
    // Build argument list (absolute paths for safety)
    const targetFiles = files.map(fp => (path.isAbsolute(fp) ? fp : path.join(ROOT_DIR, fp)));
    // Run code-fix.js with both operations
    const cmd = ['node', 'docs/scripts/code-fix.js', '--comments', '--console', '--', ...targetFiles].join(' ');
    const out = execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' }).toString();
    // Parse summary lines
    const mFiles = out.match(/Files processed:\s*(\d+)/);
    const mComments = out.match(/Comments removed:\s*(\d+)/);
    const mConsoles = out.match(/Console statements removed:\s*(\d+)/);
    const mErrors = out.match(/Errors:\s*(\d+)/);
    if (mFiles) autofixStats.filesProcessed = parseInt(mFiles[1], 10) || 0;
    if (mComments) autofixStats.commentsRemoved = parseInt(mComments[1], 10) || 0;
    if (mConsoles) autofixStats.consolesRemoved = parseInt(mConsoles[1], 10) || 0;
    if (mErrors) autofixStats.errors = parseInt(mErrors[1], 10) || 0;
  } catch (err) {
    try {
      const raw = (err && (err.stdout?.toString() || err.stderr?.toString())) || '';
      const mFiles = raw.match(/Files processed:\s*(\d+)/);
      const mComments = raw.match(/Comments removed:\s*(\d+)/);
      const mConsoles = raw.match(/Console statements removed:\s*(\d+)/);
      const mErrors = raw.match(/Errors:\s*(\d+)/);
      if (mFiles) autofixStats.filesProcessed = parseInt(mFiles[1], 10) || 0;
      if (mComments) autofixStats.commentsRemoved = parseInt(mComments[1], 10) || 0;
      if (mConsoles) autofixStats.consolesRemoved = parseInt(mConsoles[1], 10) || 0;
      if (mErrors) autofixStats.errors = parseInt(mErrors[1], 10) || 0;
      console.warn('Autofix ran with non-zero exit; continuing analysis.');
    } catch (_) {}
  }
}

// Analyze all files
const results = files.map(analyzeFile);

// Repo-wide dead/dup code analysis
const knipData = runKnip();
const jscpdData = runJscpd(TMP_JSCPD_DIR, { includeRoots: jscpdIncludeRoots, minTokens: jscpdMinTokens });
const tscData = skipTsc ? { byFile: {}, totalErrors: 0, tsconfigPath: (tsconfigOverride || path.join(ROOT_DIR, 'tsconfig.json')) } : runTsc(tsconfigOverride);
const knipAgg = applyKnipToResults(results, knipData);
const jscpdAgg = applyJscpdToResults(results, jscpdData);

let repoDuplicates;
try {
  const rawDups = Array.isArray(jscpdData?.duplicates) ? jscpdData.duplicates : [];
  const cfgIncludeRoots = jscpdIncludeRoots;
  const cfgMinTokens = jscpdMinTokens;
  const topPairsLimit = 10;
  const segmentsPerPairLimit = 3;
  const byFileLimit = 10;
  const topMatchesPerFileLimit = 5;

  const pairMap = new Map(); // key: A||B -> { a, b, segments: [{ aStart, aEnd, bStart, bEnd, lines }] }
  const perFileMap = new Map(); // file -> { file, segments, totalLines, matches: Map(other -> { otherFile, segments, totalLines }) }

  const makePairKey = (A, B) => (A <= B ? `${A}||${B}` : `${B}||${A}`);
  const addPairSeg = (A, B, seg) => {
    const key = makePairKey(A, B);
    let entry = pairMap.get(key);
    if (!entry) {
      const a = A <= B ? A : B;
      const b = A <= B ? B : A;
      entry = { a, b, segments: [] };
      pairMap.set(key, entry);
    }
    entry.segments.push(seg);
  };
  const addPerFile = (file, other, seg) => {
    let entry = perFileMap.get(file);
    if (!entry) {
      entry = { file, segments: 0, totalLines: 0, matches: new Map() };
      perFileMap.set(file, entry);
    }
    entry.segments += 1;
    entry.totalLines += (typeof seg.lines === 'number' ? seg.lines : 0);
    let m = entry.matches.get(other);
    if (!m) {
      m = { otherFile: other, segments: 0, totalLines: 0 };
      entry.matches.set(other, m);
    }
    m.segments += 1;
    m.totalLines += (typeof seg.lines === 'number' ? seg.lines : 0);
  };

  for (const d of rawDups) {
    const aName = d && d.firstFile && d.firstFile.name;
    const bName = d && d.secondFile && d.secondFile.name;
    if (!aName || !bName) continue;
    const A = toRepoRelative(aName);
    const B = toRepoRelative(bName);
    const seg = {
      aStart: d.firstFile.start,
      aEnd: d.firstFile.end,
      bStart: d.secondFile.start,
      bEnd: d.secondFile.end,
      lines: (typeof d.lines === 'number' ? d.lines : 0)
    };
    addPairSeg(A, B, seg);
    addPerFile(A, B, seg);
    addPerFile(B, A, seg);
  }

  const topPairs = Array.from(pairMap.values()).map(p => ({
    files: [p.a, p.b],
    occurrences: p.segments.length,
    totalLines: p.segments.reduce((acc, s) => acc + (s.lines || 0), 0),
    segments: p.segments.slice(0, segmentsPerPairLimit)
  }))
  .sort((x, y) => (y.totalLines - x.totalLines) || (y.occurrences - x.occurrences) || (x.files.join('|').localeCompare(y.files.join('|'))))
  .slice(0, topPairsLimit);

  const byFile = Array.from(perFileMap.values()).map(f => {
    const topMatches = Array.from(f.matches.values())
      .sort((x, y) => (y.totalLines - x.totalLines) || (y.segments - x.segments) || x.otherFile.localeCompare(y.otherFile))
      .slice(0, topMatchesPerFileLimit);
    return {
      file: f.file,
      segments: f.segments,
      totalLines: f.totalLines,
      topMatches
    };
  })
  .sort((x, y) => (y.totalLines - x.totalLines) || (y.segments - x.segments) || x.file.localeCompare(y.file))
  .slice(0, byFileLimit);

  repoDuplicates = {
    config: { includeRoots: cfgIncludeRoots, minTokens: cfgMinTokens },
    topPairs,
    byFile
  };

  // Build duplicate group details and actionable rollup (bounded for size)
  const groupsLimit = 10;
  const hashString = (s) => {
    let h = 2166136261; // FNV-1a 32-bit
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  };
  const safeRead = (relPath) => {
    try { return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8'); } catch { return ''; }
  };
  const findFunctionName = (content, nearLine) => {
    try {
      const ls = content.split('\n');
      for (let i = Math.max(0, nearLine - 1); i >= Math.max(0, nearLine - 25); i--) {
        const L = ls[i] || '';
        let m = L.match(/\bexport\s+function\s+(\w+)/) ||
                L.match(/\bfunction\s+(\w+)/) ||
                L.match(/\bexport\s+const\s+(\w+)\s*=\s*\(/) ||
                L.match(/\bconst\s+(\w+)\s*=\s*\(/);
        if (m) return m[1];
      }
    } catch {}
    return undefined;
  };
  const getPreview = (content, start, end) => {
    try {
      const ls = content.split('\n');
      const startIdx = Math.max(0, start - 1);
      const endIdx = Math.min(ls.length, Math.max(startIdx + 1, Math.min(end, start + 2)));
      return ls.slice(startIdx, endIdx).map(s => s.trim()).join('\n');
    } catch { return ''; }
  };
  const deriveCategorySuggestion = (files) => {
    const joined = files.join(' ');
    if (/wizard/i.test(joined)) return { category: 'wizard-step-ui', suggestion: 'extract component' };
    if (/components\//.test(joined) || /\.tsx$/i.test(joined)) return { category: 'form-layout', suggestion: 'extract component' };
    if (/hooks\//.test(joined) || /\buse[A-Z]/.test(joined)) return { category: 'hook', suggestion: 'extract hook' };
    if (/lib\/(utils|helpers)/.test(joined)) return { category: 'util', suggestion: 'extract util' };
    if (/(lib|services)\//.test(joined)) return { category: 'fetch-service', suggestion: 'merge services' };
    if (/filter/i.test(joined)) return { category: 'filter-controls', suggestion: 'extract component' };
    return { category: 'general', suggestion: 'extract util' };
  };
  const makeNameAndPath = (suggestion, files) => {
    const base = (p) => path.basename(p).replace(/\.[tj]sx?$/i, '');
    const a = base(files[0] || '');
    const b = base(files[1] || '');
    let common = '';
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i] && /[A-Za-z]/.test(a[i])) common += a[i]; else break;
    }
    if (common.length < 3) common = (suggestion === 'extract hook') ? 'useShared' : 'Shared';
    let name, targetPath;
    if (suggestion === 'extract component') {
      name = common.replace(/^use/, '');
      if (!/^[A-Z]/.test(name)) name = name.charAt(0).toUpperCase() + name.slice(1);
      if (!/(Component|Form)$/.test(name)) name += 'Component';
      targetPath = `components/shared/${name}.tsx`;
    } else if (suggestion === 'extract hook') {
      name = common.startsWith('use') ? common : `use${common.charAt(0).toUpperCase()}${common.slice(1)}`;
      targetPath = `hooks/${name}.ts`;
    } else if (suggestion === 'extract util') {
      name = common || 'sharedUtil';
      targetPath = `lib/utils/${name}.ts`;
    } else {
      name = common.replace(/^use/, '') || 'SharedService';
      if (!/Service$/.test(name)) name += 'Service';
      targetPath = `lib/services/${name}.ts`;
    }
    return { name, path: targetPath };
  };
  const severityFrom = (totalLines, occ) => {
    if (totalLines >= 80 || occ >= 3) return 'high';
    if (totalLines >= 40) return 'medium';
    return 'low';
  };

  const groupsSorted = Array.from(pairMap.values())
    .map(p => ({
      files: [p.a, p.b],
      occurrences: p.segments.length,
      totalLines: p.segments.reduce((acc, s) => acc + (s.lines || 0), 0),
      segments: p.segments.slice(0, segmentsPerPairLimit)
    }))
    .sort((x, y) => (y.totalLines - x.totalLines) || (y.occurrences - x.occurrences) || (x.files.join('|').localeCompare(y.files.join('|'))))
    .slice(0, groupsLimit);

  const duplicateCodeDetails = groupsSorted.map(g => {
    const { category, suggestion } = deriveCategorySuggestion(g.files);
    const severity = severityFrom(g.totalLines, g.occurrences);
    const firstSeg = g.segments[0];
    const contentA = safeRead(g.files[0]);
    const contentB = safeRead(g.files[1]);
    const previewA = contentA ? getPreview(contentA, firstSeg.aStart, firstSeg.aEnd) : '';
    const groupKey = `${g.files[0]}|${g.files[1]}|` + g.segments.map(s => `${s.aStart}-${s.aEnd}-${s.bStart}-${s.bEnd}`).join(',');
    const groupId = `G-${hashString(groupKey)}`;
    const fingerprint = hashString(previewA);
    const { name: recommendedName, path: targetPath } = makeNameAndPath(suggestion, g.files);
    const occurrences = [];
    for (const s of g.segments) {
      occurrences.push({
        file: g.files[0],
        functionName: contentA ? (findFunctionName(contentA, s.aStart) || null) : null,
        startLine: s.aStart,
        endLine: s.aEnd,
        preview: contentA ? getPreview(contentA, s.aStart, Math.min(s.aEnd, s.aStart + 2)) : ''
      });
      occurrences.push({
        file: g.files[1],
        functionName: contentB ? (findFunctionName(contentB, s.bStart) || null) : null,
        startLine: s.bStart,
        endLine: s.bEnd,
        preview: contentB ? getPreview(contentB, s.bStart, Math.min(s.bEnd, s.bStart + 2)) : ''
      });
    }
    const fixPlanSteps = (() => {
      if (suggestion === 'extract component') return [
        `Create shared ${recommendedName} with props for variability`,
        'Replace duplicate blocks with shared component',
        'Ensure explicit return types'
      ];
      if (suggestion === 'extract hook') return [
        `Create ${recommendedName} with inputs and standardized return`,
        'Use the hook in both call sites',
        'Ensure explicit return types'
      ];
      if (suggestion === 'extract util') return [
        `Create ${recommendedName} pure function`,
        'Replace duplicate logic with util',
        'Add unit tests if suitable'
      ];
      return [
        `Consolidate service logic into ${recommendedName}`,
        'Replace duplicate service functions',
        'Review file-size limits after merge'
      ];
    })();
    const estimatedEffort = (severity === 'high') ? 'L' : (severity === 'medium' ? 'M' : 'S');
    const fileLimitsRisk = (suggestion === 'merge services') && (g.totalLines > 100);
    return {
      groupId,
      fingerprint,
      similarity: { lines: g.totalLines, tokens: 0, pct: 0 },
      category,
      severity,
      suggestion,
      recommendedName,
      targetPath,
      estimatedEffort,
      fileLimitsRisk,
      occurrences,
      fixPlanSteps,
      dependencies: [],
      testImpact: (suggestion === 'merge services' || suggestion === 'extract component') ? 'medium' : 'low'
    };
  });

  const nextTopGroups = duplicateCodeDetails.map(d => d.groupId);
  const sharedModulesToCreate = duplicateCodeDetails
    .filter(d => /^(extract component|extract hook|extract util)$/.test(d.suggestion))
    .slice(0, 5)
    .map(d => ({ name: d.recommendedName, path: d.targetPath, reason: d.category }));
  const sharedModulesToReuse = [];
  const dedupeSavingsEstimateLines = duplicateCodeDetails
    .reduce((acc, d) => acc + (d.similarity.lines * Math.max(0, (Math.ceil(d.occurrences?.length / 2) || 1) - 1)), 0);

  var duplicateCodeDetailsOut = duplicateCodeDetails; // expose outside try
  var actionableItemsOut = { nextTopGroups, sharedModulesToCreate, sharedModulesToReuse, dedupeSavingsEstimateLines };
} catch (_) {
  repoDuplicates = { config: { includeRoots: [], minTokens: 0 }, topPairs: [], byFile: [] };
  var duplicateCodeDetailsOut = [];
  var actionableItemsOut = { nextTopGroups: [], sharedModulesToCreate: [], sharedModulesToReuse: [], dedupeSavingsEstimateLines: 0 };
}
  const dupSummaryWithDetails = Object.assign({}, jscpdAgg.summary, { details: duplicateCodeDetailsOut });
  // Compute summary metrics for final report
  const passedFiles = results.filter(r =>
    r.comments.status === 'PASS' &&
    r.size.status === 'PASS' &&
    r.typescript.status === 'PASS' &&
    (!r.typescriptCompiler || r.typescriptCompiler.status === 'PASS') &&
    (Array.isArray(r.eslint?.errors) ? r.eslint.errors.length === 0 : true) &&
    r.consoleErrors.status === 'PASS' &&
    r.fallbackData.status === 'PASS' &&
    (!r.deadCode || r.deadCode.status === 'PASS') &&
    (!r.duplicates || r.duplicates.status === 'PASS')
  ).length;
  const failedFiles = results.filter(r =>
    r.comments.status === 'FAIL' ||
    r.size.status === 'FAIL' ||
    r.typescript.status === 'FAIL' ||
    (r.typescriptCompiler && r.typescriptCompiler.status === 'FAIL') ||
    (Array.isArray(r.eslint?.errors) ? r.eslint.errors.length > 0 : false) ||
    r.consoleErrors.status === 'FAIL' ||
    r.fallbackData.status === 'FAIL' ||
    (r.deadCode && r.deadCode.status === 'FAIL') ||
    (r.duplicates && r.duplicates.status === 'FAIL')
  ).length;
  const eslintErrors = results.reduce((acc, r) => acc + (Array.isArray(r.eslint?.errors) ? r.eslint.errors.length : 0), 0);
  const typescriptIssues = results.reduce((acc, r) => acc + (typeof r.typescript?.missingReturnTypes === 'number' ? r.typescript.missingReturnTypes : 0), 0);
  const tscErrors = typeof tscData?.totalErrors === 'number' ? tscData.totalErrors : 0;
  const oversizedFiles = results.filter(r => r.size && r.size.status === 'FAIL').length;
  const finalHasFailures = (failedFiles > 0) || (tscErrors > 0);
  const detailedAnalysis = {
    metadata: {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      passedFiles,
      failedFiles
    },
    summary: {
      blockingViolations: failedFiles,
      eslintErrors,
      typescriptIssues,
      tscErrors,
      tsconfigPath: (typeof tscData?.tsconfigPath === 'string' ? toRepoRelative(tscData.tsconfigPath) : 'not provided'),
      oversizedFiles,
      deadCodeIssues: knipAgg.summary,
      autofix: (autofixStats && autofixStats.enabled) ? {
        filesProcessed: autofixStats.filesProcessed,
        commentsRemoved: autofixStats.commentsRemoved,
        consolesRemoved: autofixStats.consolesRemoved,
        errors: autofixStats.errors
      } : { filesProcessed: 0, commentsRemoved: 0, consolesRemoved: 0, errors: 0 },
      duplicateCode: dupSummaryWithDetails
    },
    results,
    repoDuplicates,
    tsc: { tsconfigPath: (typeof tscData?.tsconfigPath === 'string' ? toRepoRelative(tscData.tsconfigPath) : 'not provided'), totalErrors: tscErrors },
    actionableItems: actionableItemsOut
  };
  
  // Generate human-readable summaries and include them in the report
  const compactSummary = generateCompactSummary(results);
  const batchSummary = generateBatchSummary(results);
  detailedAnalysis.humanSummary = {
    compact: compactSummary,
    batch: batchSummary
  };
  
  // Print summaries to console: compact always, batch only on failures
  try {
    if (compactSummary) {
      console.log('\n' + compactSummary);
    }
    if (finalHasFailures && batchSummary) {
      console.log(batchSummary);
    }
  } catch (_) { /* no-op */ }
  
  try {
    if (finalHasFailures) {
      // Ensure directory exists
      const analysisDir = path.dirname(ANALYSIS_FILE);
      if (!fs.existsSync(analysisDir)) {
        fs.mkdirSync(analysisDir, { recursive: true });
      }
      
      fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(detailedAnalysis, null, 2));
      // Call-to-action for AI to process and implement fixes from the report
      console.log(`AI ACTION REQUIRED: Consume and process this report to implement all recommended fixes → ${ANALYSIS_FILE}`);
    } else {
      // Clean up any stale report from previous runs when there are no violations
      if (fs.existsSync(ANALYSIS_FILE)) {
        fs.unlinkSync(ANALYSIS_FILE);
      }
    }
  } catch (error) {
    console.error(`Error writing analysis file: ${error.message}`);
    process.exit(1);
  }
  
  // Exit with error code if any violations found
  if (finalHasFailures) {
    process.exit(1);
  }
}

main();
