 const { execSync, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');
const { ROOT_DIR, OUTPUT_DIR } = require('../utils/paths');

function runEslint(filePath) {
  try {
    const reviewDir = path.join(ROOT_DIR, '.windsurf', 'review');
    const configPath = path.join(reviewDir, '.eslintrc.review.cjs');
    const q = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
    const cmd = `npx --prefix ${q(reviewDir)} eslint --config ${q(configPath)} --resolve-plugins-relative-to ${q(reviewDir)} --cache --cache-location ${q(path.join(reviewDir, '.eslintcache'))} --max-warnings=0 --no-ignore ${q(filePath)}`;
    execSync(cmd, { stdio: 'pipe', cwd: ROOT_DIR });
    return { errors: [], warnings: [] };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errors = [];
    const warnings = [];

    output.split('\n').forEach(line => {
      if (line.includes('File ignored because of a matching ignore pattern')) {
        return;
      }
      if (line.includes('error')) {
        // Try to capture: "line:col  error  message  rule"
        let match = line.match(/(\d+):(\d+)\s+error\s+(.+?)(?:\s{2,}([@\w-\/]+))?\s*$/);
        if (match) {
          errors.push({ line: parseInt(match[1]), column: parseInt(match[2]), message: match[3].trim(), rule: match[4] || null });
        }
      } else if (line.includes('warning')) {
        let match = line.match(/(\d+):(\d+)\s+warning\s+(.+?)(?:\s{2,}([@\w-\/]+))?\s*$/);
        if (match) {
          warnings.push({ line: parseInt(match[1]), column: parseInt(match[2]), message: match[3].trim(), rule: match[4] || null });
        }
      }
    });

    return { errors, warnings };
  }
}

// Run ESLint once for all files and return a map of absolutePath -> { errors, warnings }
async function runEslintBatch(filePaths) {
  return runEslintBatchUnion(filePaths, { mode: 'union' });
}

/** Detect if project-level ESLint config exists at repo root */
function detectProjectEslintConfig() {
  try {
    const candidates = [
      'eslint.config.js', 'eslint.config.cjs', 'eslint.config.mjs',
      '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml',
      'package.json'
    ];
    for (const name of candidates) {
      const p = path.join(ROOT_DIR, name);
      if (fs.existsSync(p)) {
        if (name === 'package.json') {
          try {
            const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (pkg && pkg.eslintConfig) return true;
          } catch (_) {}
        } else {
          return true;
        }
      }
    }
  } catch (_) {}
  return false;
}

function parseEslintJson(raw) {
  let arr;
  try { arr = JSON.parse(raw); } catch { arr = []; }
  if (!Array.isArray(arr)) arr = [];
  const map = {};
  for (const item of arr) {
    const key = path.resolve(item.filePath || '');
    const errors = [];
    const warnings = [];
    const msgs = Array.isArray(item.messages) ? item.messages : [];
    for (const m of msgs) {
      const entry = {
        line: m.line || 0,
        column: m.column || 0,
        endLine: m.endLine || undefined,
        endColumn: m.endColumn || undefined,
        message: (m.message || '').trim(),
        rule: m.ruleId || null,
        fixable: !!m.fix
      };
      if (m.severity === 2) errors.push(entry); else if (m.severity === 1) warnings.push(entry);
    }
    map[key] = { errors, warnings };
  }
  return map;
}

function mergeResultMaps(mapA, mapB) {
  const out = {};
  const allKeys = new Set([...(Object.keys(mapA || {})), ...(Object.keys(mapB || {}))]);
  for (const k of allKeys) {
    const a = mapA[k] || { errors: [], warnings: [] };
    const b = mapB[k] || { errors: [], warnings: [] };
    const seen = new Set();
    const errors = [];
    const warnings = [];
    const pushUnique = (arr, isError) => {
      for (const it of arr) {
        const key = `${it.line}:${it.column}:${it.rule || ''}:${it.message}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (isError) errors.push(it); else warnings.push(it);
      }
    };
    // If a duplicate appears once as error and once as warning, keep as error
    const errorSig = (it) => `${it.line}:${it.column}:${it.rule || ''}:${it.message}`;
    const bErrorSigs = new Set((b.errors || []).map(errorSig));
    const aErrorSigs = new Set((a.errors || []).map(errorSig));

    // First, add all errors from both
    pushUnique(a.errors || [], true);
    pushUnique(b.errors || [], true);
    // Then add warnings that are not already errors
    for (const it of (a.warnings || [])) {
      const sig = errorSig(it);
      if (aErrorSigs.has(sig) || bErrorSigs.has(sig)) continue;
      pushUnique([it], false);
    }
    for (const it of (b.warnings || [])) {
      const sig = errorSig(it);
      if (aErrorSigs.has(sig) || bErrorSigs.has(sig)) continue;
      pushUnique([it], false);
    }
    out[k] = { errors, warnings };
  }
  return out;
}

async function runEslintSubtreeBatch(filePaths) {
  const resultMap = {};
  const files = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
  if (files.length === 0) return resultMap;
  const normalized = files.map(fp => path.resolve(fp));
  for (const abs of normalized) resultMap[abs] = { errors: [], warnings: [] };
  const reviewDir = path.join(ROOT_DIR, '.windsurf', 'review');
  const configPath = path.join(reviewDir, '.eslintrc.review.cjs');
  const q = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
  const quoted = files.map(fp => q(fp)).join(' ');
  const cacheDir = path.join(OUTPUT_DIR, '.tmp', 'eslint');
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch (_) {}
  const cachePath = path.join(cacheDir, 'subtree.cache');
  const cmd = `npx --prefix ${q(reviewDir)} eslint --format json --no-ignore --no-error-on-unmatched-pattern --max-warnings=0 --cache --cache-location ${q(cachePath)} --config ${q(configPath)} --resolve-plugins-relative-to ${q(reviewDir)} ${quoted}`;
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT_DIR, maxBuffer: 64 * 1024 * 1024 });
    const raw = String(stdout || stderr || '[]');
    return parseEslintJson(raw);
  } catch (err) {
    const raw = String((err && (err.stdout?.toString() || err.stderr?.toString())) || '[]');
    try { return parseEslintJson(raw); } catch { return resultMap; }
  }
}

async function runEslintProjectBatch(filePaths) {
  const resultMap = {};
  const files = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
  if (files.length === 0) return resultMap;
  const normalized = files.map(fp => path.resolve(fp));
  for (const abs of normalized) resultMap[abs] = { errors: [], warnings: [] };
  const reviewDir = path.join(ROOT_DIR, '.windsurf', 'review');
  const q = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
  const quoted = files.map(fp => q(fp)).join(' ');
  const cacheDir = path.join(OUTPUT_DIR, '.tmp', 'eslint');
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch (_) {}
  const cachePath = path.join(cacheDir, 'project.cache');
  // Use subtree's eslint binary for stability, but resolve plugins relative to project root and do not force a config
  const cmd = `npx --prefix ${q(reviewDir)} eslint --format json --no-error-on-unmatched-pattern --max-warnings=0 --cache --cache-location ${q(cachePath)} --resolve-plugins-relative-to ${q(ROOT_DIR)} ${quoted}`;
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT_DIR, maxBuffer: 64 * 1024 * 1024 });
    const raw = String(stdout || stderr || '[]');
    return parseEslintJson(raw);
  } catch (err) {
    const raw = String((err && (err.stdout?.toString() || err.stderr?.toString())) || '[]');
    try { return parseEslintJson(raw); } catch { return resultMap; }
  }
}

async function runEslintBatchUnion(filePaths, options = {}) {
  const mode = (options.mode || 'union');
  const hasProject = detectProjectEslintConfig();
  if (mode === 'subtree' || !hasProject) {
    return await runEslintSubtreeBatch(filePaths);
  }
  if (mode === 'project') {
    return await runEslintProjectBatch(filePaths);
  }
  // union: run both in parallel and merge
  const [proj, sub] = await Promise.all([
    runEslintProjectBatch(filePaths),
    runEslintSubtreeBatch(filePaths)
  ]);
  return mergeResultMaps(proj, sub);
}

module.exports = { runEslint, runEslintBatch, runEslintBatchUnion };

