 const { execSync, exec } = require('child_process');
 const { promisify } = require('util');
 const execAsync = promisify(exec);
 const path = require('path');

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
        return;
      }
      if (line.includes('error')) {
        const match = line.match(/(\d+):(\d+)\s+error\s+(.+)/);
        if (match) {
          errors.push({ line: parseInt(match[1]), column: parseInt(match[2]), message: match[3].trim() });
        }
      } else if (line.includes('warning')) {
        const match = line.match(/(\d+):(\d+)\s+warning\s+(.+)/);
        if (match) {
          warnings.push({ line: parseInt(match[1]), column: parseInt(match[2]), message: match[3].trim() });
        }
      }
    });

    return { errors, warnings };
  }
}

// Run ESLint once for all files and return a map of absolutePath -> { errors, warnings }
async function runEslintBatch(filePaths) {
  const resultMap = {};
  try {
    const files = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
    if (files.length === 0) return resultMap;
    const quoted = files.map(fp => `"${String(fp).replace(/"/g, '\\"')}"`).join(' ');
    const cmd = `npx eslint --format json --no-ignore --max-warnings=0 ${quoted}`;
    try {
      const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 64 * 1024 * 1024 });
      const raw = String(stdout || stderr || '[]');
      let arr;
      try { arr = JSON.parse(raw); } catch { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      for (const item of arr) {
        const key = path.resolve(item.filePath || '');
        const errors = [];
        const warnings = [];
        const msgs = Array.isArray(item.messages) ? item.messages : [];
        for (const m of msgs) {
          const entry = { line: m.line || 0, column: m.column || 0, message: (m.message || '').trim() };
          if (m.severity === 2) errors.push(entry); else if (m.severity === 1) warnings.push(entry);
        }
        resultMap[key] = { errors, warnings };
      }
    } catch (err) {
      const raw = String((err && (err.stdout?.toString() || err.stderr?.toString())) || '[]');
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          for (const item of arr) {
            const key = path.resolve(item.filePath || '');
            const errors = [];
            const warnings = [];
            const msgs = Array.isArray(item.messages) ? item.messages : [];
            for (const m of msgs) {
              const entry = { line: m.line || 0, column: m.column || 0, message: (m.message || '').trim() };
              if (m.severity === 2) errors.push(entry); else if (m.severity === 1) warnings.push(entry);
            }
            resultMap[key] = { errors, warnings };
          }
        }
      } catch (_) {
        // If JSON parse fails, fall back to empty results
      }
    }
  } catch (_) {}
  return resultMap;
}

module.exports = { runEslint, runEslintBatch };
