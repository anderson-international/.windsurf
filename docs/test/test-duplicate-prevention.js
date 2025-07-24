/**
 * Test script to verify that the duplicate rate prevention fix works correctly
 * 
 * This script tests the new delete-then-create approach to ensure rates are replaced
 * rather than duplicated on subsequent deployments.
 */

require('dotenv').config()

async function testDuplicatePrevention() {
  console.log('🔄 Testing Duplicate Rate Prevention Fix...\n')

  try {
    console.log('📊 Step 1: First deployment (should create rates)')
    await runDeployment('First')

    console.log('\n📊 Step 2: Second deployment (should replace, not duplicate)')
    await runDeployment('Second')

    console.log('\n📊 Step 3: Checking for duplicates in Shopify')
    await checkForDuplicates()

    console.log('\n✅ Duplicate prevention test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

async function runDeployment(deploymentName) {
  console.log(`   Running ${deploymentName} deployment...`)
  
  const startTime = Date.now()
  
  const response = await fetch('http://localhost:3000/api/rates/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json()
  const duration = Date.now() - startTime

  if (response.ok && data.data?.success) {
    console.log(`   ✅ ${deploymentName} deployment successful:`)
    console.log(`      - Deployed: ${data.data.deployed_rates} rates`)
    console.log(`      - Duration: ${duration}ms`)
    console.log(`      - Errors: ${data.data.errors?.length || 0}`)
    
    if (data.data.errors?.length > 0) {
      console.log(`      - Error details: ${data.data.errors.join(', ')}`)
    }
  } else {
    console.log(`   ❌ ${deploymentName} deployment failed:`)
    console.log(`      - Status: ${response.status}`)
    console.log(`      - Error: ${data.error || 'Unknown error'}`)
    throw new Error(`${deploymentName} deployment failed`)
  }
}

async function checkForDuplicates() {
  console.log('   Checking Zone 6 (US) for duplicate rates...')
  
  try {
    const response = await fetch('http://localhost:3000/api/rates/delivery-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        weight: 1.5,
        country_code: 'US'
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.data?.length > 0) {
        console.log(`   Found ${data.data.length} delivery options for 1.5kg to US`)
        
        // Check for duplicate names (which would indicate duplicates)
        const optionNames = data.data.map(option => option.name)
        const uniqueNames = [...new Set(optionNames)]
        
        if (optionNames.length === uniqueNames.length) {
          console.log('   ✅ No duplicate option names detected')
        } else {
          console.log('   ⚠️  Potential duplicates detected:')
          const duplicates = optionNames.filter((name, index) => optionNames.indexOf(name) !== index)
          duplicates.forEach(name => console.log(`      - Duplicate: ${name}`))
        }

        console.log('   📋 Sample options:')
        data.data.slice(0, 3).forEach((option, i) => {
          console.log(`      ${i+1}. ${option.name}: $${option.price}`)
        })
      } else {
        console.log('   ❌ No delivery options found - API may not be working')
      }
    } else {
      console.log('   ❌ Delivery options API request failed')
    }
  } catch (error) {
    console.log(`   ❌ Duplicate check failed: ${error.message}`)
  }
}

if (require.main === module) {
  testDuplicatePrevention()
}

module.exports = { testDuplicatePrevention }
