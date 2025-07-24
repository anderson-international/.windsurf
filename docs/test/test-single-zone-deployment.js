/**
 * Test script for single-zone deployment to verify duplicate prevention fix
 * 
 * This script tests our fix by deploying rates to a single zone,
 * avoiding Shopify API throttling while verifying delete-then-create logic works.
 */

require('dotenv').config()

async function testSingleZoneDeployment() {
  console.log('🎯 Testing Single Zone Deployment (Duplicate Prevention Fix)...\n')

  try {
    // Test with the zone that has the most duplicates for maximum validation
    const testZoneId = 'gid://shopify/DeliveryZone/302956380367'
    
    console.log(`📍 Testing Zone: ${testZoneId}`)
    console.log('🔄 Step 1: Check existing rates before deployment')
    await checkExistingRates(testZoneId)
    
    console.log('\n🔄 Step 2: Deploy rates for single zone')
    const deployResult = await deploySingleZone(testZoneId)
    
    console.log('\n🔄 Step 3: Verify deployment results')
    await verifyDeploymentResults(deployResult)
    
    console.log('\n🔄 Step 4: Check for duplicates after deployment')
    await checkForDuplicatesPostDeployment(testZoneId)
    
    console.log('\n✅ Single zone deployment test completed!')

  } catch (error) {
    console.error('❌ Single zone deployment test failed:', error.message)
  }
}

async function checkExistingRates(zoneId) {
  console.log('   Checking existing rates in Shopify...')
  
  try {
    const response = await fetch('http://localhost:3000/api/shipping-rates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.success && data.data) {
        const zoneRates = data.data.filter(rate => 
          (rate.zoneId || rate.zone_id) === zoneId
        )
        
        console.log(`   📊 Found ${zoneRates.length} existing rates for this zone`)
        
        if (zoneRates.length > 0) {
          const titles = zoneRates.map(rate => rate.title || rate.rate_title)
          const uniqueTitles = [...new Set(titles)]
          
          if (titles.length !== uniqueTitles.length) {
            console.log(`   ⚠️  DUPLICATES DETECTED: ${titles.length} rates, ${uniqueTitles.length} unique`)
          } else {
            console.log(`   ✅ No duplicates detected: ${uniqueTitles.length} unique rates`)
          }
        }
      } else {
        console.log('   ⚠️  Could not fetch existing rates:', data.error)
      }
    } else {
      console.log('   ⚠️  Failed to check existing rates')
    }
  } catch (error) {
    console.log('   ❌ Error checking existing rates:', error.message)
  }
}

async function deploySingleZone(zoneId) {
  console.log(`   Deploying rates for zone: ${zoneId}`)
  
  const startTime = Date.now()
  
  const response = await fetch('http://localhost:3000/api/rates/deploy-zone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      zone_id: zoneId
    })
  })

  const data = await response.json()
  const duration = Date.now() - startTime

  if (response.ok && data.data?.success) {
    console.log('   ✅ Single zone deployment successful:')
    console.log(`      - Zone: ${data.data.zone_id}`)
    console.log(`      - Deployed: ${data.data.deployed_rates} rates`)
    console.log(`      - Deleted: ${data.data.existing_method_definitions} existing rates`)
    console.log(`      - Duration: ${duration}ms`)
    
    return data.data
  } else {
    console.log('   ❌ Single zone deployment failed:')
    console.log(`      - Status: ${response.status}`)
    console.log(`      - Error: ${data.error || 'Unknown error'}`)
    throw new Error(`Single zone deployment failed: ${data.error}`)
  }
}

async function verifyDeploymentResults(deployResult) {
  console.log('   Verifying deployment results...')
  
  console.log(`   📋 Deployment Summary:`)
  console.log(`      - Success: ${deployResult.success}`)
  console.log(`      - Zone: ${deployResult.zone_id}`)
  console.log(`      - Rates Deployed: ${deployResult.deployed_rates}`)
  console.log(`      - Existing Rates Deleted: ${deployResult.existing_method_definitions}`)
  
  if (deployResult.existing_method_definitions > 0) {
    console.log('   ✅ Duplicate prevention working - deleted existing rates before creating new ones')
  } else {
    console.log('   📝 No existing rates found to delete (clean deployment)')
  }
  
  if (deployResult.deployed_rates > 0) {
    console.log('   ✅ New rates successfully deployed')
  } else {
    console.log('   ⚠️  No rates were deployed')
  }
}

async function checkForDuplicatesPostDeployment(zoneId) {
  console.log('   Checking for duplicates after deployment...')
  
  // Wait a moment for Shopify to process
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  try {
    const response = await fetch('http://localhost:3000/api/rates/delivery-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        weight: 1.5,
        country_code: 'US'  // Assuming our test zone is US
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.data?.length > 0) {
        console.log(`   📊 Found ${data.data.length} delivery options after deployment`)
        
        // Check for duplicate names
        const optionNames = data.data.map(option => option.name)
        const uniqueNames = [...new Set(optionNames)]
        
        if (optionNames.length === uniqueNames.length) {
          console.log('   ✅ SUCCESS: No duplicate option names detected')
          console.log('   🎉 Duplicate prevention fix is working!')
        } else {
          console.log('   ⚠️  Potential duplicates still detected:')
          const duplicates = optionNames.filter((name, index) => optionNames.indexOf(name) !== index)
          duplicates.forEach(name => console.log(`      - Duplicate: ${name}`))
        }
      } else {
        console.log('   ⚠️  No delivery options returned - may need time to propagate')
      }
    } else {
      console.log('   ⚠️  Could not verify post-deployment state')
    }
  } catch (error) {
    console.log('   ❌ Error checking post-deployment duplicates:', error.message)
  }
}

if (require.main === module) {
  testSingleZoneDeployment()
}

module.exports = { testSingleZoneDeployment }
