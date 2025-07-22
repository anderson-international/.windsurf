#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Count lines and comments in multiple files
 * Usage: node count-lines.js [--comments] file1.js file2.ts file3.tsx
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

function main() {
  const args = process.argv.slice(2);
  const commentMode = args[0] === '--comments';
  const files = commentMode ? args.slice(1) : args;
  
  if (files.length === 0) {
    console.error('Usage: node count-lines.js [--comments] <file1> <file2> ...');
    process.exit(1);
  }

  let totalFiles = 0;
  let totalLines = 0;
  let totalComments = 0;
  let errors = 0;

  if (commentMode) {
    console.log('File Comment Count Report');
    console.log('=========================');

    files.forEach(file => {
      const result = countComments(file);
      totalFiles++;
      
      if (result.success) {
        totalComments += result.totalComments;
        console.log(`${file}: ${result.totalComments} comments (${result.singleLineComments} //, ${result.multiLineComments} /* */, ${result.jsDocComments} JSDoc)`);
      } else {
        errors++;
        console.log(`${file}: ERROR - ${result.error}`);
      }
    });

    console.log('=========================');
    console.log(`Total files: ${totalFiles}`);
    console.log(`Total comments: ${totalComments}`);
  } else {
    console.log('File Line Count Report');
    console.log('=====================');

    files.forEach(file => {
      const result = countLines(file);
      totalFiles++;
      
      if (result.success) {
        totalLines += result.lines;
        console.log(`${file}: ${result.lines} lines`);
      } else {
        errors++;
        console.log(`${file}: ERROR - ${result.error}`);
      }
    });

    console.log('=====================');
    console.log(`Total files: ${totalFiles}`);
    console.log(`Total lines: ${totalLines}`);
  }
  
  if (errors > 0) {
    console.log(`Errors: ${errors}`);
  }
}

main();
