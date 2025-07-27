/**
 * Test script for /api/rates/generate-all endpoint
 * Tests multi-carrier rate generation functionality
 */

const BASE_URL = 'http://localhost:3000'

async function testGenerateAllCarriers() {
  console.log('🧪 Testing Generate All Carriers Endpoint')
  console.log('========================================\n')

  try {
    console.log('📡 Making request to /api/rates/generate-all...')
    
    const response = await fetch(`${BASE_URL}/api/rates/generate-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📋 Response Data:`)
    console.log(JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log('\n✅ SUCCESS - Multi-carrier rate generation completed')
      console.log(`   📈 Total Carriers: ${data.total_carriers}`)
      console.log(`   ✅ Successful: ${data.successful_carriers}`)
      console.log(`   ❌ Failed: ${data.failed_carriers}`)
      
      if (data.results && data.results.length > 0) {
        console.log('\n📊 Per-Carrier Results:')
        data.results.forEach((result, index) => {
          const status = result.success ? '✅' : '❌'
          const carrierInfo = result.carrier_name ? ` (${result.carrier_name})` : ''
          console.log(`   ${status} Carrier ${result.carrier_id}${carrierInfo}: ${result.zones_processed} zones, ${result.rates_generated} rates`)
          
          if (result.errors && result.errors.length > 0) {
            console.log(`      Errors: ${result.errors.join(', ')}`)
          }
        })
      }
    } else {
      console.log('\n❌ FAILED - Multi-carrier rate generation failed')
      if (data.errors) {
        console.log(`   Errors: ${data.errors.join(', ')}`)
      }
    }
  } catch (error) {
    console.error('\n💥 REQUEST FAILED:', error.message)
  }
}

async function testInvalidMethod() {
  console.log('\n\n🧪 Testing Invalid Method (GET)')
  console.log('================================\n')

  try {
    const response = await fetch(`${BASE_URL}/api/rates/generate-all`, {
      method: 'GET'
    })

    const data = await response.json()
    
    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📋 Response Data:`)
    console.log(JSON.stringify(data, null, 2))
    
    if (response.status === 405) {
      console.log('\n✅ SUCCESS - Correctly rejected GET method')
    } else {
      console.log('\n❌ UNEXPECTED - Should have returned 405 Method Not Allowed')
    }
  } catch (error) {
    console.error('\n💥 REQUEST FAILED:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Multi-Carrier Rate Generation Tests')
  console.log('==============================================\n')
  
  await testGenerateAllCarriers()
  await testInvalidMethod()
  
  console.log('\n🏁 All tests completed!')
}

// Run tests
runAllTests().catch(console.error)
