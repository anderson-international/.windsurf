const { spawn } = require('child_process')

async function testRateGeneration() {
  console.log('🧪 Rate Generation API Test Suite')
  console.log('==================================\n')

  const tests = [
    {
      name: 'Successful Rate Generation (POST)',
      command: 'curl',
      args: ['-X', 'POST', 'http://localhost:3001/api/rates/generate'],
      expectedStatus: 200,
      expectedFields: ['success', 'zones_processed', 'rates_generated', 'execution_time_ms']
    },
    {
      name: 'Method Not Allowed (GET)',
      command: 'curl',
      args: ['-X', 'GET', 'http://localhost:3001/api/rates/generate'],
      expectedStatus: 405,
      expectedFields: ['success', 'errors']
    }
  ]

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`)
    console.log('-'.repeat(50))
    
    try {
      const result = await runCommand(test.command, test.args)
      const response = JSON.parse(result)
      
      console.log('✅ Response received:')
      console.log(JSON.stringify(response, null, 2))
      
      // Validate expected fields
      const missingFields = test.expectedFields.filter(field => !(field in response))
      if (missingFields.length === 0) {
        console.log('✅ All expected fields present')
      } else {
        console.log(`❌ Missing fields: ${missingFields.join(', ')}`)
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`)
    }
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args)
    let output = ''
    let error = ''

    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.stderr.on('data', (data) => {
      error += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim())
      } else {
        reject(new Error(`Command failed with code ${code}: ${error}`))
      }
    })
  })
}

if (require.main === module) {
  testRateGeneration().catch(console.error)
}

module.exports = { testRateGeneration }
