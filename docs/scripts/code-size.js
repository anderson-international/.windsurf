#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Enhanced file analysis tool
 * Usage: 
 *   node code-size.js [--byte|--comments] [--guides] [files...]
 *   node code-size.js --byte --guides
 *   node code-size.js --comments file1.ts file2.tsx
 */

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    return { success: true, lines, error: null };
  } catch (error) {
    return { success: false, lines: 0, error: error.message };
  }
}

function countBytes(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    const isMarkdown = path.extname(filePath) === '.md';
    
    let status, message;
    if (isMarkdown) {
      const isUnderLimit = bytes <= 7800;
      if (isUnderLimit) {
        const percentage = Math.round(((7800 - bytes) / 7800) * 100);
        status = '✅';
        message = `${bytes.toLocaleString()} bytes (${percentage}% under limit)`;
      } else {
        const overBy = bytes - 7800;
        status = '❌';
        message = `${bytes.toLocaleString()} bytes (${overBy} bytes OVER)`;
      }
    } else {
      status = '✅';
      message = `${bytes.toLocaleString()} bytes (no limit)`;
    }
    
    return { success: true, bytes, status, message, isMarkdown, error: null };
  } catch (error) {
    return { success: false, bytes: 0, status: '❌', message: `ERROR - ${error.message}`, isMarkdown: false, error: error.message };
  }
}

function countComments(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let singleLineComments = 0;
    let multiLineComments = 0;
    let jsDocComments = 0;
    let inMultiLineComment = false;
    let inJsDoc = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for JSDoc start
      if (trimmed.startsWith('/**')) {
        inJsDoc = true;
        jsDocComments++;
        continue;
      }
      
      // Check for multi-line comment start
      if (trimmed.startsWith('/*') && !trimmed.startsWith('/**')) {
        inMultiLineComment = true;
        multiLineComments++;
        continue;
      }
      
      // Check for comment end
      if (trimmed.endsWith('*/')) {
        inMultiLineComment = false;
        inJsDoc = false;
        continue;
      }
      
      // Count lines inside multi-line comments
      if (inMultiLineComment) {
        multiLineComments++;
        continue;
      }
      
      // Count lines inside JSDoc
      if (inJsDoc) {
        jsDocComments++;
        continue;
      }
      
      // Count single-line comments
      if (trimmed.startsWith('//')) {
        singleLineComments++;
      }
    }
    
    const totalComments = singleLineComments + multiLineComments + jsDocComments;
    return { 
      success: true, 
      totalComments,
      singleLineComments,
      multiLineComments, 
      jsDocComments,
      error: null 
    };
  } catch (error) {
    return { success: false, totalComments: 0, singleLineComments: 0, multiLineComments: 0, jsDocComments: 0, error: error.message };
  }
}

function getGuideFiles() {
  try {
    const guidesDir = path.join(process.cwd(), 'docs', 'guides');
    const files = fs.readdirSync(guidesDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(guidesDir, file));
  } catch (error) {
    console.error('Error finding guide files:', error.message);
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  
  // Parse flags
  const byteMode = args.includes('--byte');
  const commentMode = args.includes('--comments');
  const guidesMode = args.includes('--guides');
  
  // Remove flags to get file list
  const fileArgs = args.filter(arg => !arg.startsWith('--'));
  
  // Determine file list
  let files;
  if (guidesMode) {
    files = getGuideFiles();
    if (files.length === 0) {
      console.error('No guide files found in docs/guides/');
      process.exit(1);
    }
  } else {
    files = fileArgs;
  }
  
  if (files.length === 0) {
    console.error('Usage: node code-size.js [--byte|--comments] [--guides] [files...]');
    console.error('Examples:');
    console.error('  node code-size.js --byte --guides');
    console.error('  node code-size.js --comments file1.ts file2.tsx');
    console.error('  node code-size.js --guides');
    process.exit(1);
  }

  // Execute appropriate mode
  if (byteMode) {
    runByteMode(files, guidesMode);
  } else if (commentMode) {
    runCommentMode(files, guidesMode);
  } else {
    runLineMode(files, guidesMode);
  }
}

function runByteMode(files, isGuidesMode) {
  const title = isGuidesMode 
    ? 'Byte Size Check - docs/guides/*.md (7800 byte limit)'
    : 'Byte Size Check';
  
  console.log(title);
  console.log('='.repeat(title.length));
  
  let totalFiles = 0;
  let passed = 0;
  let failed = 0;
  const passingFiles = [];
  const failingFiles = [];
  
  files.forEach(file => {
    const result = countBytes(file);
    totalFiles++;
    
    const output = result.success 
      ? `${result.status} ${path.basename(file)}: ${result.message}`
      : `❌ ${path.basename(file)}: ${result.message}`;
    
    if (result.success && result.status === '✅') {
      passed++;
      passingFiles.push(output);
    } else {
      failed++;
      failingFiles.push(output);
    }
  });
  
  // Output passing files first
  if (passingFiles.length > 0) {
    console.log('\nPASSING FILES:');
    passingFiles.forEach(line => console.log(line));
  }
  
  // Output failing files second
  if (failingFiles.length > 0) {
    console.log('\nFAILING FILES:');
    failingFiles.forEach(line => console.log(line));
  }
  
  console.log('\n' + '='.repeat(title.length));
  const overallStatus = failed === 0 ? '✅ OVERALL: PASS' : '❌ OVERALL: FAIL';
  console.log(`${overallStatus} | ${totalFiles} files | ${passed} passed | ${failed} failed`);
}

function runCommentMode(files, isGuidesMode) {
  const title = isGuidesMode 
    ? 'Comment Count - docs/guides/*.md'
    : 'Comment Count';
  
  console.log(title);
  console.log('='.repeat(title.length));
  
  let totalFiles = 0;
  let totalComments = 0;
  let errors = 0;
  const successFiles = [];
  const errorFiles = [];
  
  files.forEach(file => {
    const result = countComments(file);
    totalFiles++;
    
    if (result.success) {
      totalComments += result.totalComments;
      const output = `✅ ${path.basename(file)}: ${result.totalComments} comments (${result.singleLineComments} //, ${result.multiLineComments} /* */, ${result.jsDocComments} JSDoc)`;
      successFiles.push(output);
    } else {
      errors++;
      const output = `❌ ${path.basename(file)}: ERROR - ${result.error}`;
      errorFiles.push(output);
    }
  });
  
  // Output successful files first
  if (successFiles.length > 0) {
    console.log('\nSUCCESSFUL FILES:');
    successFiles.forEach(line => console.log(line));
  }
  
  // Output error files second
  if (errorFiles.length > 0) {
    console.log('\nERROR FILES:');
    errorFiles.forEach(line => console.log(line));
  }
  
  console.log('\n' + '='.repeat(title.length));
  const overallStatus = errors === 0 ? '✅ OVERALL: PASS' : '❌ OVERALL: FAIL';
  console.log(`${overallStatus} | ${totalFiles} files | ${totalComments.toLocaleString()} comments | ${errors} errors`);
}

function runLineMode(files, isGuidesMode) {
  const title = isGuidesMode 
    ? 'Line Count - docs/guides/*.md'
    : 'Line Count';
  
  console.log(title);
  console.log('='.repeat(title.length));
  
  let totalFiles = 0;
  let totalLines = 0;
  let errors = 0;
  const successFiles = [];
  const errorFiles = [];
  
  files.forEach(file => {
    const result = countLines(file);
    totalFiles++;
    
    if (result.success) {
      totalLines += result.lines;
      const output = `✅ ${path.basename(file)}: ${result.lines.toLocaleString()} lines`;
      successFiles.push(output);
    } else {
      errors++;
      const output = `❌ ${path.basename(file)}: ERROR - ${result.error}`;
      errorFiles.push(output);
    }
  });
  
  // Output successful files first
  if (successFiles.length > 0) {
    console.log('\nSUCCESSFUL FILES:');
    successFiles.forEach(line => console.log(line));
  }
  
  // Output error files second
  if (errorFiles.length > 0) {
    console.log('\nERROR FILES:');
    errorFiles.forEach(line => console.log(line));
  }
  
  console.log('\n' + '='.repeat(title.length));
  const overallStatus = errors === 0 ? '✅ OVERALL: PASS' : '❌ OVERALL: FAIL';
  console.log(`${overallStatus} | ${totalFiles} files | ${totalLines.toLocaleString()} lines | ${errors} errors`);
}

main();
