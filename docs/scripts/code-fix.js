const fs = require('fs')
const path = require('path')

class CodeFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      commentsRemoved: 0,
      consoleStatementsRemoved: 0,
      errors: 0
    }
  }

  /**
   * Remove comments from TypeScript/JavaScript file content
   * @param {string} content - File content
   * @returns {object} - {content: string, removedCount: number}
   */
  removeComments(content) {
    let removedCount = 0
    let result = content

    // Remove JSDoc blocks (/** ... */)
    result = result.replace(/\/\*\*[\s\S]*?\*\//g, (match) => {
      removedCount++
      return ''
    })

    // Remove multi-line comments (/* ... */)
    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      removedCount++
      return ''
    })

    // Remove single-line comments (// ...)
    result = result.replace(/^\s*\/\/.*$/gm, (match) => {
      removedCount++
      return ''
    })

    // Remove inline comments but preserve code on same line
    result = result.replace(/^(.+?)\s*\/\/.*$/gm, (match, code) => {
      if (code.trim()) {
        removedCount++
        return code
      }
      return match
    })

    // Clean up multiple consecutive empty lines (more than 2)
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

    return { content: result, removedCount }
  }

  /**
   * Remove console statements from content
   * Only removes console.log, console.debug, console.info
   * NOTE: console.error and console.warn are BLOCKING VIOLATIONS
   * They violate fail-fast principles and must be replaced with proper error throwing
   * Use code-review-analyzer.js to detect these violations
   * @param {string} content - File content
   * @returns {object} - {content, removedCount}
   */
  removeConsoleStatements(content) {
    let removedCount = 0
    let result = content

    // Remove console.log statements (debugging only)
    result = result.replace(/^\s*console\.log\([^)]*\);?\s*$/gm, (match) => {
      removedCount++
      return ''
    })

    // Remove console.debug statements
    result = result.replace(/^\s*console\.debug\([^)]*\);?\s*$/gm, (match) => {
      removedCount++
      return ''
    })

    // Remove console.info statements
    result = result.replace(/^\s*console\.info\([^)]*\);?\s*$/gm, (match) => {
      removedCount++
      return ''
    })

    // Keep console.error and console.warn - these may be needed for error handling
    // They should be manually reviewed and converted to proper error throwing

    // Clean up multiple consecutive empty lines (more than 2)
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

    return { content: result, removedCount }
  }



  /**
   * Process a single file for comment removal
   * @param {string} filePath - Path to file
   * @returns {boolean} - Success status
   */
  processFile(filePath) {
    try {
      // Validate file exists
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`)
        this.stats.errors++
        return false
      }

      // Check if it's a TypeScript/JavaScript file
      const ext = path.extname(filePath).toLowerCase()
      if (!['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
        console.error(`❌ Unsupported file type: ${filePath}`)
        this.stats.errors++
        return false
      }

      console.log(`🔧 Processing: ${filePath}`)

      // Read file content
      const originalContent = fs.readFileSync(filePath, 'utf8')
      
      // Remove comments
      const { content: newContent, removedCount } = this.removeComments(originalContent)

      // Write modified content back
      fs.writeFileSync(filePath, newContent, 'utf8')

      console.log(`✅ Removed ${removedCount} comments from ${path.basename(filePath)}`)
      this.stats.filesProcessed++
      this.stats.commentsRemoved += removedCount

      return true
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
      return false
    }
  }

  /**
   * Process a single file for console statement removal
   * @param {string} filePath - Path to file
   * @returns {boolean} - Success status
   */
  processFileForConsole(filePath) {
    try {
      // Validate file exists
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`)
        this.stats.errors++
        return false
      }

      // Check if it's a TypeScript/JavaScript file
      const ext = path.extname(filePath).toLowerCase()
      if (!['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
        console.error(`❌ Unsupported file type: ${filePath}`)
        this.stats.errors++
        return false
      }

      console.log(`🔧 Processing: ${filePath}`)

      // Read file content
      const originalContent = fs.readFileSync(filePath, 'utf8')
      
      // Remove console statements
      const { content: newContent, removedCount } = this.removeConsoleStatements(originalContent)

      // Write modified content back
      fs.writeFileSync(filePath, newContent, 'utf8')

      console.log(`✅ Removed ${removedCount} console statements from ${path.basename(filePath)}`)
      this.stats.filesProcessed++
      this.stats.consoleStatementsRemoved += removedCount

      return true
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      this.stats.errors++
      return false
    }
  }

  /**
   * Process multiple files
   * @param {string[]} filePaths - Array of file paths
   */
  processFiles(filePaths) {
    console.log(`🚀 Starting comment removal for ${filePaths.length} files...\n`)

    for (const filePath of filePaths) {
      this.processFile(filePath)
    }

    this.printSummary()
  }

  /**
   * Process multiple files for console statement removal
   * @param {string[]} filePaths - Array of file paths
   */
  processFilesForConsole(filePaths) {
    console.log(`🚀 Starting console statement removal for ${filePaths.length} files...\n`)

    for (const filePath of filePaths) {
      this.processFileForConsole(filePath)
    }

    this.printSummary()
  }

  /**
   * Print processing summary
   */
  printSummary() {
    console.log('\n📊 PROCESSING SUMMARY')
    console.log('='.repeat(50))
    console.log(`Files processed: ${this.stats.filesProcessed}`)
    console.log(`Comments removed: ${this.stats.commentsRemoved}`)
    console.log(`Console statements removed: ${this.stats.consoleStatementsRemoved}`)
    console.log(`Errors: ${this.stats.errors}`)

    if (this.stats.errors === 0 && this.stats.filesProcessed > 0) {
      console.log('\n✅ All files processed successfully!')
    }
  }
}

function showUsage() {
  console.log(`
🔧 Code Fix Tool

Usage:
  node code-fix.js --comments <file1> <file2> ...
  node code-fix.js --console <file1> <file2> ...

Flags:
  --comments    Remove all comments from specified files
  --console     Remove console.log/debug/info statements from specified files

Examples:
  node code-fix.js --comments pages/api/rates/deploy.ts
  node code-fix.js --console pages/api/rates/deploy.ts
  node code-fix.js --comments file1.ts file2.ts file3.ts

Features:
  ✅ Removes JSDoc blocks (/** ... */)
  ✅ Removes single-line comments (// ...)
  ✅ Removes multi-line comments (/* ... */)
  ✅ Removes console.log/debug/info statements
  ✅ Preserves console.error/warn for manual review

  ✅ Batch processing support
  ✅ TypeScript/JavaScript file validation
  ✅ Processing statistics

Safety:
  - Only processes .ts, .js, .tsx, .jsx files
  - Preserves code structure and spacing
`)
}

// Main execution
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showUsage()
    process.exit(1)
  }

  const flag = args[0]
  const files = args.slice(1)

  if (flag === '--comments') {
    if (files.length === 0) {
      console.error('❌ No files specified for comment removal')
      console.error('   Usage: node code-fix.js --comments <file1> <file2> ...')
      process.exit(1)
    }

    const fixer = new CodeFixer()
    fixer.processFiles(files)
  } else if (flag === '--console') {
    if (files.length === 0) {
      console.error('❌ No files specified for console statement removal')
      console.error('   Usage: node code-fix.js --console <file1> <file2> ...')
      process.exit(1)
    }

    const fixer = new CodeFixer()
    fixer.processFilesForConsole(files)
  } else {
    console.error(`❌ Unknown flag: ${flag}`)
    showUsage()
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = CodeFixer
