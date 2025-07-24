#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ANALYSIS_FILE = path.join(__dirname, '..', 'review', 'code_review.json');
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
    if (fs.existsSync(ANALYSIS_FILE)) {
      fs.unlinkSync(ANALYSIS_FILE);
    }
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

function runEslint(filePath) {
  try {
    execSync(`npx eslint "${filePath}" --max-warnings=0`, { stdio: 'pipe' });
    return { errors: [], warnings: [] };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errors = [];
    const warnings = [];
    
    output.split('\n').forEach(line => {
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

function analyzeTypeScript(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Comprehensive regex to capture various TypeScript function patterns
    const patterns = [
      // export const func = (): Type => {} (including multi-line)
      /(?:export\s+)?const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/gm,
      // export function func<T>(): Type {}
      /(?:export\s+)?function\s+\w+(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g,
      // const func = async (): Type => {}
      /const\s+\w+\s*=\s*async\s+\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/g
    ];
    
    const functions = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      functions.push(...matches);
    });
    
    const missingReturnTypes = [];
    
    functions.forEach(func => {
      // Check if function has explicit return type annotation
      // Handle various patterns:
      // 1. Simple: ) : Type => or ) : Type {
      // 2. Complex: ) : Record<string, boolean> => 
      // 3. Curried: ) : (param: Type) => ReturnType => 
      // 4. Generic: ) : Promise<T> => 
      // 5. Multi-line curried: )\n: (param: Type) => ReturnType => 
      const hasReturnType = /\)\s*:\s*[^=>{]+(?:=>|\{)/.test(func) || 
                           /\)\s*:\s*[A-Z][\w<>\[\],\s]*(?:=>|\{)/.test(func) ||
                           /\)\s*:\s*\([^)]+\)\s*=>/.test(func); // Any curried function pattern
      
      if (!hasReturnType) {
        // Skip void functions, constructors, and common patterns that don't need return types
        if (!func.includes('constructor') && 
            !func.includes('(): void') && 
            !func.includes('Promise<void>') &&
            !func.trim().endsWith('=> {')) {
          missingReturnTypes.push(func.trim());
        }
      }
    });
    
    return {
      totalFunctions: functions.length,
      missingReturnTypes: missingReturnTypes.length,
      hasExplicitTypes: missingReturnTypes.length === 0,
      status: missingReturnTypes.length === 0 ? 'PASS' : 'FAIL'
    };
  } catch (error) {
    return { totalFunctions: 0, missingReturnTypes: 0, hasExplicitTypes: true, status: 'PASS' };
  }
}

function analyzeFile(filePath) {
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
  const eslintAnalysis = runEslint(filePath);
  const typeScriptAnalysis = analyzeTypeScript(filePath);
  
  return {
    filePath,
    size: sizeAnalysis,
    comments: commentAnalysis,
    react: reactAnalysis,
    eslint: eslintAnalysis,
    typescript: typeScriptAnalysis
  };
}

function generateCompactSummary(results) {
  const totalFiles = results.length;
  const failedFiles = results.filter(r => 
    r.eslint.errors.length > 0 || r.eslint.warnings.length > 0 || 
    r.comments.status === 'FAIL' || 
    r.size.status === 'FAIL' || 
    r.typescript.status === 'FAIL'
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
  const passedFiles = results.filter(r => r.comments.status === 'PASS' && r.size.status === 'PASS' && r.typescript.status === 'PASS' && r.eslint.errors.length === 0);
  const failedFiles = results.filter(r => r.comments.status === 'FAIL' || r.size.status === 'FAIL' || r.typescript.status === 'FAIL' || r.eslint.errors.length > 0);
  
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
      if (file.eslint.errors.length > 0) issues.push(`eslint (${file.eslint.errors.length} errors)`);
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
  const files = process.argv.slice(2);
  
  if (files.length === 0) {
    console.error('Usage: node code-review-analyzer.js <file1> <file2> ...');
    process.exit(1);
  }
  
  // Check if this is a batch test (multiple files with test patterns)
  const isBatchTest = files.length > 1 && files.some(f => f.includes('test/typescript-analyzer/'));
  
  // FAIL-SAFE: Delete stale analysis file
  deleteStaleAnalysis();
  
  // Analyze all files
  const results = files.map(analyzeFile);
  
  // Generate appropriate summary
  let summary;
  if (isBatchTest) {
    summary = generateBatchSummary(results);
  } else {
    summary = generateCompactSummary(results);
  }
  
  console.log(summary);
  
  // Write detailed analysis to file
  const detailedAnalysis = {
    timestamp: new Date().toISOString(),
    totalFiles: results.length,
    results: results.reduce((acc, result) => {
      acc[result.filePath] = result;
      return acc;
    }, {})
  };
  
  try {
    // Ensure directory exists
    const analysisDir = path.dirname(ANALYSIS_FILE);
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }
    
    fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(detailedAnalysis, null, 2));
  } catch (error) {
    console.error(`Error writing analysis file: ${error.message}`);
    process.exit(1);
  }
}

main();
