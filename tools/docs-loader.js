#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Minimal Document Loader
 * Usage: node ai-subtree-loader.js <document-name>
 * Outputs document content to stdout for AI ingestion
 */

function loadDocument(docName) {
  if (!docName || docName === '--help' || docName === '-h') {
    console.error('Usage: node ai-subtree-loader.js <document-name>')
    console.error('Example: node ai-subtree-loader.js code-critical')
    process.exit(1)
  }

  // Map document name to file path
  const ai-subtreeDir = path.join(__dirname, '..')
  const possiblePaths = [
    path.join(ai-subtreeDir, 'guides', `${docName}.md`),
    path.join(ai-subtreeDir, 'project', `${docName}.md`),
    path.join(ai-subtreeDir, 'ai-reference', `${docName}.md`),
  ]

  // Find the document file
  let filePath = null
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      filePath = testPath
      break
    }
  }

  if (!filePath) {
    console.error(`Error: Document '${docName}' not found in any ai-subtree directory`)
    process.exit(1)
  }

  try {
    // Read and output document content
    const content = fs.readFileSync(filePath, 'utf8')
    process.stdout.write(content)
  } catch (error) {
    console.error(`Error reading document '${docName}': ${error.message}`)
    process.exit(1)
  }
}

// Execute if called directly
if (require.main === module) {
  const docName = process.argv[2]
  loadDocument(docName)
}

module.exports = { loadDocument }
