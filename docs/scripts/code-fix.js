const fs = require('fs')
const path = require('path')

class CodeFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      commentsRemoved: 0,
      consoleStatementsRemoved: 0,
      errors: 0,
      filesDeleted: 0,
      dirsDeleted: 0,
      missingSkipped: 0
    }
    // Repository root (script is at docs/scripts/*)
    this.repoRoot = path.resolve(__dirname, '../../')
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
    result = result.replace(/\/\*\*[\s\S]*?\*\//g, () => {
      removedCount++
      return ''
    })

    // Remove multi-line comments (/* ... */)
    result = result.replace(/\/\*[\s\S]*?\*\//g, () => {
      removedCount++
      return ''
    })

    // Remove single-line comments (// ...)
    result = result.replace(/^\s*\/\/.*$/gm, () => {
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
    // Allow optional trailing inline comments so order with --comments is irrelevant
    result = result.replace(/^\s*console\.log\([^)]*\);?(?:\s*\/\/.*)?\s*$/gm, () => {
      removedCount++
      return ''
    })

    // Remove console.debug statements
    result = result.replace(/^\s*console\.debug\([^)]*\);?(?:\s*\/\/.*)?\s*$/gm, () => {
      removedCount++
      return ''
    })

    // Remove console.info statements
    result = result.replace(/^\s*console\.info\([^)]*\);?(?:\s*\/\/.*)?\s*$/gm, () => {
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
   * Delete a single path (file or directory) with safety checks
   * @param {string} targetPath - Absolute or relative path
   * @returns {boolean}
   */
  deletePath(targetPath) {
    try {
      if (!targetPath || typeof targetPath !== 'string') {
        console.error('❌ Invalid path argument')
        this.stats.errors++
        return false
      }

      const abs = path.isAbsolute(targetPath)
        ? path.normalize(targetPath)
        : path.resolve(process.cwd(), targetPath)

      // Safety: ensure inside repository and not the repo root itself
      const relToRoot = path.relative(this.repoRoot, abs)
      const isOutside = relToRoot.startsWith('..') || path.isAbsolute(relToRoot)
      if (isOutside || abs === this.repoRoot) {
        console.error(`⛔ Refused to delete outside repository root: ${abs}`)
        this.stats.errors++
        return false
      }

      if (!fs.existsSync(abs)) {
        console.log(`⏭️  Skipped (missing): ${path.relative(process.cwd(), abs)}`)
        this.stats.missingSkipped++
        return true
      }

      const stat = fs.lstatSync(abs)

      // Prefer fs.rmSync when available (Node 14+)
      const rm = fs.rmSync || null
      if (stat.isDirectory()) {
        if (rm) {
          rm.call(fs, abs, { recursive: true, force: true })
        } else {
          this._removeRecursively(abs)
        }
        console.log(`🗂️  Deleted directory: ${path.relative(process.cwd(), abs)}`)
        this.stats.dirsDeleted++
      } else {
        fs.unlinkSync(abs)
        console.log(`🗑️  Deleted file: ${path.relative(process.cwd(), abs)}`)
        this.stats.filesDeleted++
      }

      return true
    } catch (error) {
      console.error(`❌ Error deleting ${targetPath}:`, error.message)
      this.stats.errors++
      return false
    }
  }

  /**
   * Fallback recursive removal for Node versions without fs.rmSync
   * @param {string} p
   */
  _removeRecursively(p) {
    if (!fs.existsSync(p)) return
    const stat = fs.lstatSync(p)
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(p)) {
        this._removeRecursively(path.join(p, entry))
      }
      fs.rmdirSync(p)
    } else {
      fs.unlinkSync(p)
    }
  }

  /**
   * Delete multiple paths
   * @param {string[]} paths
   */
  deletePaths(paths) {
    console.log(`🚀 Starting deletion for ${paths.length} path(s)...\n`)
    for (const p of paths) {
      this.deletePath(p)
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
    console.log(`Files deleted: ${this.stats.filesDeleted}`)
    console.log(`Directories deleted: ${this.stats.dirsDeleted}`)
    console.log(`Missing skipped: ${this.stats.missingSkipped}`)
    console.log(`Errors: ${this.stats.errors}`)

    if (this.stats.errors === 0 && this.stats.filesProcessed > 0) {
      console.log('\n✅ All files processed successfully!')
    }
  }
}

function showUsage() {
  console.log(`
🔧 Code Fix Tool — docs/scripts/code-fix.js

Automate removal of code comments and debug console statements; safely delete files/directories within the repository.

USAGE
  node docs/scripts/code-fix.js --help
  node docs/scripts/code-fix.js --comments <file1> [file2 ...]
  node docs/scripts/code-fix.js --console  <file1> [file2 ...]
  node docs/scripts/code-fix.js --delete   <path1> [path2 ...]
  node docs/scripts/code-fix.js --comments --console <file1> [file2 ...]
  node docs/scripts/code-fix.js --console  --comments <file1> [file2 ...]

OPTIONS
  --help, -h        Show this help and exit 0

  --comments        Remove all comments from specified files
                    • Supports: .ts .tsx .js .jsx
                    • Removes: JSDoc (/** ... */), multi-line (/* ... */), single-line (// ...), and inline // while preserving code

  --console         Remove debug console statements from specified files
                    • Removes: console.log, console.debug, console.info
                    • Keeps:   console.warn, console.error (intentional — review manually)

  --delete          Delete specified files/directories (scoped to repo root)
                    • Safe-guards:
                      - Refuses deletion outside repo root
                      - Refuses deleting the repo root itself
                      - Missing paths are logged as “Skipped (missing)”
                    • Uses fs.rmSync({ recursive: true, force: true }) when available, otherwise a safe recursive fallback

COMBINING OPERATIONS
  • You can combine --comments and --console; order does not matter
  • --delete cannot be combined with other flags and must be used alone

OUTPUT
  • Per-item progress logs
  • Summary block:
      Files processed
      Comments removed
      Console statements removed
      Files deleted
      Directories deleted
      Missing skipped
      Errors

EXIT CODES
  0  Success (including --help)
  1  Misuse or error (e.g., unknown flag, missing arguments, unsupported file type, deletion safety violation)

EXAMPLES
  # Remove comments from files
  node docs/scripts/code-fix.js --comments pages/api/rates/deploy.ts
  node docs/scripts/code-fix.js --comments file1.ts file2.tsx file3.js

  # Remove debug console statements
  node docs/scripts/code-fix.js --console pages/api/rates/deploy.ts

  # Combine operations (order agnostic)
  node docs/scripts/code-fix.js --comments --console pages/api/rates/deploy.ts
  node docs/scripts/code-fix.js --console --comments pages/api/rates/deploy.ts

  # Delete files/dirs (Windows CMD without spaces)
  node docs/scripts/code-fix.js --delete app/assessments hooks/useAssessments.ts

  # Delete files/dirs with spaces (CMD/PowerShell)
  node docs/scripts/code-fix.js --delete "lib/services/assessment-transformers-api.ts" "lib/types/assessment types.ts"

NOTES
  • Paths may be relative to the current working directory or absolute
  • For fix operations, only .ts, .tsx, .js, .jsx are processed; other types are rejected
  • Globs are not expanded by CMD — pass explicit paths
  • Use "--" to stop flag parsing if a path starts with a dash (e.g., -- "--strange-file.ts")

RECOMMENDED POST-RUN (production dirs: app/, components/, lib/, types/, hooks/)
  # Validate changes meet code quality and TypeScript checks
  node docs/scripts/code-review-analyzer.js <modified-files>
`)
}

// Main execution
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showUsage()
    process.exit(1)
  }

  // Help flag can appear anywhere
  if (args.some((a) => a === '--help' || a === '-h' || a === 'help' || a === '/?')) {
    showUsage()
    process.exit(0)
  }

  // Parse flags (ordered) and collect files
  const ops = [] // ordered list of operation flags
  const files = []
  let parsingFlags = true
  for (const a of args) {
    if (parsingFlags) {
      if (a === '--') { parsingFlags = false; continue }
      if (a.startsWith('--')) {
        if (a === '--comments' || a === '--console' || a === '--delete') {
          if (!ops.includes(a)) ops.push(a)
        } else if (a === '--help' || a === '-h') {
          // already handled above, but keep for completeness
          showUsage(); process.exit(0)
        } else {
          console.error(`❌ Unknown flag: ${a}`)
          showUsage()
          process.exit(1)
        }
      } else {
        parsingFlags = false
        files.push(a)
      }
    } else {
      files.push(a)
    }
  }

  if (ops.length === 0) {
    console.error('❌ No operation flag specified')
    showUsage()
    process.exit(1)
  }

  const hasDelete = ops.includes('--delete')
  if (hasDelete && ops.length > 1) {
    console.error('❌ --delete cannot be combined with other flags')
    showUsage()
    process.exit(1)
  }

  if (files.length === 0) {
    if (hasDelete) {
      console.error('❌ No paths specified for deletion')
      console.error('   Usage: node code-fix.js --delete <path1> <path2> ...')
    } else {
      console.error('❌ No files specified')
      console.error('   Usage: node code-fix.js --comments [--console] <file1> <file2> ...')
    }
    process.exit(1)
  }

  const fixer = new CodeFixer()

  if (hasDelete) {
    fixer.deletePaths(files)
    return
  }

  console.log(`🚀 Starting fix operations: ${ops.join(' ')} for ${files.length} file(s)...\n`)
  for (const filePath of files) {
    for (const op of ops) {
      if (op === '--comments') {
        fixer.processFile(filePath)
      } else if (op === '--console') {
        fixer.processFileForConsole(filePath)
      }
    }
  }
  fixer.printSummary()
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = CodeFixer
