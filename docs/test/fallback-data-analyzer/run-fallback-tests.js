// TEST RUNNER: Fallback Data Detection Validation
// Runs code-review-analyzer on all test files to validate detection accuracy

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const testDir = __dirname
const analyzerScript = path.join(__dirname, '../../code-review-analyzer.js')

// Test files that SHOULD trigger violations (failures expected)
const failureTests = [
  '01-return-null-failures.tsx',
  '03-or-fallback-failures.tsx', 
  '05-optional-chaining-failures.tsx',
  '07-ternary-failures.tsx',
  '09-catch-block-failures.tsx'
]

// Test files that should NOT trigger violations (passes expected)
const passingTests = [
  '02-return-null-passes.tsx',
  '04-or-fallback-passes.tsx',
  '06-optional-chaining-passes.tsx', 
  '08-ternary-passes.tsx',
  '10-catch-block-passes.tsx',
  '11-edge-cases-passes.tsx'
]

console.log('🧪 FALLBACK DATA DETECTION TEST SUITE')
console.log('=====================================\n')

let totalTests = 0
let passedTests = 0
let failedTests = 0

function runTest(filename, shouldFail = false) {
  const filePath = path.join(testDir, filename)
  const testType = shouldFail ? 'FAILURE' : 'PASSING'
  
  console.log(`Testing ${filename} (${testType} test)...`)
  
  try {
    // Run the analyzer on the test file
    const result = execSync(`cmd /c node ${analyzerScript}" "${filePath}`, { 
      encoding: 'utf8',
      cwd: path.dirname(analyzerScript)
    })
    
    const hasFallbackViolations = result.includes('FALLBACK DATA VIOLATION')
    const hasFailures = result.includes('❌ FAILED') || result.includes('VIOLATION DETECTED')
    
    totalTests++
    
    if (shouldFail) {
      // This test should detect violations
      if (hasFallbackViolations && hasFailures) {
        console.log(`  ✅ PASS - Correctly detected fallback violations`)
        passedTests++
      } else {
        console.log(`  ❌ FAIL - Should have detected fallback violations but didn't`)
        console.log(`  Fallback violations found: ${hasFallbackViolations}`)
        console.log(`  Has failures: ${hasFailures}`)
        failedTests++
      }
    } else {
      // This test should NOT detect violations
      if (!hasFallbackViolations && !hasFailures) {
        console.log(`  ✅ PASS - Correctly passed without false positives`)
        passedTests++
      } else {
        console.log(`  ❌ FAIL - False positive: detected violations when it shouldn't`)
        console.log(`  Fallback violations found: ${hasFallbackViolations}`)
        console.log(`  Has failures: ${hasFailures}`)
        failedTests++
      }
    }
    
  } catch (error) {
    totalTests++
    failedTests++
    console.log(`  ❌ ERROR - Test execution failed: ${error.message}`)
  }
  
  console.log('')
}

// Run failure tests (should detect violations)
console.log('🔍 TESTING FAILURE CASES (should detect violations)')
console.log('------------------------------------------------')
failureTests.forEach(filename => {
  if (fs.existsSync(path.join(testDir, filename))) {
    runTest(filename, true)
  } else {
    console.log(`⚠️  Test file ${filename} not found, skipping...`)
  }
})

// Run passing tests (should NOT detect violations)  
console.log('✅ TESTING PASSING CASES (should NOT detect violations)')
console.log('----------------------------------------------------')
passingTests.forEach(filename => {
  if (fs.existsSync(path.join(testDir, filename))) {
    runTest(filename, false)
  } else {
    console.log(`⚠️  Test file ${filename} not found, skipping...`)
  }
})

// Summary
console.log('📊 TEST RESULTS SUMMARY')
console.log('=======================')
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${passedTests}`)
console.log(`Failed: ${failedTests}`)
console.log(`Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`)

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Fallback data detection is working correctly.')
} else {
  console.log(`\n⚠️  ${failedTests} test(s) failed. Review the output above for details.`)
  process.exit(1)
}
