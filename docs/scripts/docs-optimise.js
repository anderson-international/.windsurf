const fs = require('fs')
const path = require('path')

class DocsAnalyzer {
  constructor() {
    this.rootDir = path.resolve(process.cwd(), 'docs')
    this.excludedPaths = ['node_modules', '.git', 'dist', 'build', 'coverage']
  }

  findDocuments(dir = this.rootDir) {
    const docs = []

    try {
      const items = fs.readdirSync(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          if (!this.excludedPaths.includes(item)) {
            docs.push(...this.findDocuments(fullPath))
          }
        } else if (item.endsWith('.md')) {
          docs.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message)
    }

    return docs
  }

  calculateCLS(content) {
    const lines = content.split('\n')
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    // Basic readability (inverse of sentence complexity)
    const avgSentenceLength =
      sentences.length > 0
        ? sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length
        : 0
    const readabilityScore = Math.max(0, 100 - (avgSentenceLength - 15) * 2)

    // Lexical complexity (vocabulary diversity)
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const uniqueWords = new Set(words)
    const lexicalScore =
      words.length > 0 ? Math.min(100, (uniqueWords.size / words.length) * 150) : 0

    // Topic coherence (technical term consistency)
    const technicalTerms = [
      'react',
      'component',
      'hook',
      'state',
      'effect',
      'prop',
      'typescript',
      'api',
      'database',
    ]
    const technicalDensity =
      words.length > 0
        ? (words.filter((w) => technicalTerms.includes(w)).length / words.length) * 100
        : 0
    const coherenceScore = Math.min(100, technicalDensity * 10)

    // Weighted CLS calculation
    const cls = Math.round(readabilityScore * 0.4 + lexicalScore * 0.3 + coherenceScore * 0.3)

    return {
      cls,
      readabilityScore: Math.round(readabilityScore),
      lexicalScore: Math.round(lexicalScore),
      coherenceScore: Math.round(coherenceScore),
    }
  }

  generateRecommendations(cls, target, codePercentage) {
    const recommendations = []

    if (cls <= target) {
      recommendations.push('✅ Document meets CLS target')
    } else {
      const diff = cls - target
      if (codePercentage > 70) {
        recommendations.push('🔒 Code-dominant file - limited optimization potential')
        recommendations.push('   - Focus on comments and explanatory text')
        recommendations.push('   - Simplify code examples where possible')
      } else if (diff > 20) {
        recommendations.push('🔴 High priority: Significant CLS reduction needed')
        recommendations.push('   - Break down complex sentences')
        recommendations.push('   - Replace jargon with simpler alternatives')
        recommendations.push('   - Improve content structure')
      } else if (diff > 10) {
        recommendations.push('🟡 Medium priority: Moderate CLS reduction needed')
        recommendations.push('   - Simplify sentence structure')
        recommendations.push('   - Reduce technical complexity where possible')
      } else {
        recommendations.push('🟢 Low priority: Minor CLS reduction needed')
        recommendations.push('   - Fine-tune sentence length')
      }
    }

    return recommendations
  }

  analyzeDocument(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const stats = fs.statSync(filePath)
      const byteSize = stats.size

      // Calculate percentage of code (code blocks and inline code)
      const codeBlocks = content.match(/```[\s\S]*?```/g) || []
      const inlineCode = content.match(/`[^`\n]+`/g) || [] // Exclude newlines from inline code

      // Calculate total code content length
      let codeContentLength = 0
      codeBlocks.forEach((block) => {
        codeContentLength += block.length
      })
      inlineCode.forEach((code) => {
        codeContentLength += code.length
      })

      const codePercentage =
        content.length > 0
          ? Math.min(100, Math.round((codeContentLength / content.length) * 100))
          : 0

      // Calculate CLS
      const clsMetrics = this.calculateCLS(content)

      // Determine staged CLS target based on code percentage
      // 55 for no code, rising to 80 for code-dominant files
      const clsTarget = Math.round(55 + (codePercentage / 100) * 25)

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        clsMetrics.cls,
        clsTarget,
        codePercentage
      )

      // Determine if optimization is worth it
      const worthOptimizing = clsMetrics.cls > clsTarget && codePercentage < 70

      return {
        filePath,
        byteSize,
        codePercentage,
        cls: clsMetrics.cls,
        clsTarget,
        readabilityScore: clsMetrics.readabilityScore,
        lexicalScore: clsMetrics.lexicalScore,
        coherenceScore: clsMetrics.coherenceScore,
        recommendations,
        worthOptimizing,
      }
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message)
      return null
    }
  }

  async analyzeAll() {
    console.log('📊 Document Analysis Report')
    console.log('==========================\n')

    const documents = this.findDocuments()
    const results = []

    for (const doc of documents) {
      const analysis = this.analyzeDocument(doc)
      if (analysis) {
        results.push(analysis)
      }
    }

    // Sort by CLS score (highest first)
    results.sort((a, b) => b.cls - a.cls)

    // Display results (compact format)
    results.forEach((result) => {
      const relativePath = path.relative(process.cwd(), result.filePath)
      const statusIcon = result.cls <= result.clsTarget ? '✅' : '⚠️'
      const priority =
        result.cls > result.clsTarget
          ? result.cls - result.clsTarget > 20
            ? '🔴'
            : result.cls - result.clsTarget > 10
              ? '🟡'
              : '🟢'
          : '✅'

      console.log(
        `${statusIcon} ${relativePath} | ${result.byteSize}b | ${result.codePercentage}% code | CLS:${result.cls}/${result.clsTarget} ${priority}`
      )
    })

    // Summary statistics
    const totalDocs = results.length
    const passedDocs = results.filter((r) => r.cls <= r.clsTarget).length
    const avgCLS = Math.round(results.reduce((sum, r) => sum + r.cls, 0) / totalDocs)
    const avgByteSize = Math.round(results.reduce((sum, r) => sum + r.byteSize, 0) / totalDocs)
    const avgCodePercentage = Math.round(
      results.reduce((sum, r) => sum + r.codePercentage, 0) / totalDocs
    )

    console.log('📈 SUMMARY STATISTICS')
    console.log('====================')
    console.log(`📄 Total documents: ${totalDocs}`)
    console.log(
      `✅ Documents meeting CLS target: ${passedDocs}/${totalDocs} (${Math.round((passedDocs / totalDocs) * 100)}%)`
    )
    console.log(`🧠 Average CLS: ${avgCLS}/100`)
    console.log(`📏 Average byte size: ${avgByteSize.toLocaleString()} bytes`)
    console.log(`💻 Average code percentage: ${avgCodePercentage}%`)

    const worthOptimizingCount = results.filter((r) => r.worthOptimizing).length
    console.log(`🔧 Documents worth optimizing: ${worthOptimizingCount}/${totalDocs}`)

    return results
  }

  async handleCLI() {
    const args = process.argv.slice(2)

    // Show help
    if (args[0] === '--help' || args[0] === '-h') {
      console.log(`📊 Document Analysis Tool

Usage:
  node docs/scripts/docs-optimise.js [options]

Options:
  --help, -h          Show this help message
  --file <path>       Analyze a specific file
  --files <path1> <path2> ...  Analyze multiple specific files
  
Examples:
  node docs/scripts/docs-optimise.js
  node docs/scripts/docs-optimise.js --file docs/guides/react-core.md
  node docs/scripts/docs-optimise.js --files docs/guides/react-core.md docs/guides/react-hooks.md

Features:
  • Byte size analysis
  • Code percentage calculation
  • Staged CLS targets (55 for text-only, up to 80 for code-heavy files)
  • Optimization recommendations
  • Summary statistics`)
      return
    }

    // Analyze single file
    if (args[0] === '--file' && args[1]) {
      const filePath = path.resolve(args[1])
      const analysis = this.analyzeDocument(filePath)

      if (analysis) {
        const relativePath = path.relative(process.cwd(), analysis.filePath)
        const statusIcon = analysis.cls <= analysis.clsTarget ? '✅' : '⚠️'
        const optimizationNote = analysis.worthOptimizing
          ? '🔧 Worth optimizing'
          : '🔒 Code-dominant - limited optimization value'

        console.log(`📊 Analysis for ${relativePath}`)
        console.log('==============================\n')
        console.log(
          `${statusIcon} Status: ${analysis.cls <= analysis.clsTarget ? 'PASSED' : 'NEEDS ATTENTION'}`
        )
        console.log(`📏 Byte size: ${analysis.byteSize.toLocaleString()} bytes`)
        console.log(`💻 Code percentage: ${analysis.codePercentage}%`)
        console.log(`🧠 CLS: ${analysis.cls}/100 (target: ≤${analysis.clsTarget})`)
        console.log(
          `📊 Breakdown: Readability ${analysis.readabilityScore}, Lexical ${analysis.lexicalScore}, Coherence ${analysis.coherenceScore}`
        )
        console.log(`💡 ${optimizationNote}\n`)

        if (analysis.recommendations.length > 0) {
          console.log(`📋 Recommendations:`)
          analysis.recommendations.forEach((rec) => {
            console.log(`   ${rec}`)
          })
        }
      }
      return
    }

    // Analyze multiple files
    if (args[0] === '--files' && args.length > 1) {
      const filePaths = args.slice(1)
      console.log(`📊 Analysis for ${filePaths.length} files`)
      console.log('=====================================\n')

      for (const filePath of filePaths) {
        const fullPath = path.resolve(filePath)
        const analysis = this.analyzeDocument(fullPath)

        if (analysis) {
          const relativePath = path.relative(process.cwd(), analysis.filePath)
          const statusIcon = analysis.cls <= analysis.clsTarget ? '✅' : '⚠️'
          const optimizationNote = analysis.worthOptimizing
            ? '🔧 Worth optimizing'
            : '🔒 Code-dominant - limited optimization value'

          console.log(`${statusIcon} ${relativePath}`)
          console.log(`   📏 Byte size: ${analysis.byteSize.toLocaleString()} bytes`)
          console.log(`   💻 Code percentage: ${analysis.codePercentage}%`)
          console.log(`   🧠 CLS: ${analysis.cls}/100 (target: ≤${analysis.clsTarget})`)
          console.log(`   💡 ${optimizationNote}`)
          console.log('')
        }
      }
      return
    }

    // Default: analyze all files
    await this.analyzeAll()
  }
}

// Initialize and run
const analyzer = new DocsAnalyzer()
analyzer.handleCLI().catch(console.error)
