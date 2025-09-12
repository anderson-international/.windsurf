 const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');
const { ROOT_DIR, OUTPUT_DIR } = require('../utils/paths');

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
// Run ESLint once for a batch of files using the PROJECT configuration.
// Returns a map: absolutePath -> { errors, warnings }.
// Throws on execution or parse failure. No per-file fallback.
async function runEslintBatch(filePaths) {
  const files = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
  const resultMap = {};
  if (files.length === 0) return resultMap;

  const reviewDir = path.join(ROOT_DIR, '.windsurf', 'review');
  const q = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
  const quoted = files.map(fp => q(fp)).join(' ');
  const cacheDir = path.join(OUTPUT_DIR, '.tmp', 'eslint');
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch (_) {}
  const cachePath = path.join(cacheDir, 'project.cache');
  const cmd = `npx --prefix ${q(reviewDir)} eslint --ext .ts,.tsx --format json --max-warnings=0 --cache --cache-location ${q(cachePath)} ${quoted}`;
  const timeout = 180000;
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT_DIR, maxBuffer: 64 * 1024 * 1024, timeout });
    const raw = String(stdout || stderr || '[]');
    return parseEslintJson(raw);
  } catch (err) {
    const raw = String((err && (err.stdout?.toString() || err.stderr?.toString())) || '').trim();
    const msg = raw ? raw.slice(0, 2000) : String(err && err.message || 'ESLint execution failed');
    const e = new Error(`ESLint batch failed: ${msg}`);
    e.code = 'ESLINT_BATCH_FAILED';
    throw e;
  }
}

module.exports = { runEslintBatch, detectProjectEslintConfig };

