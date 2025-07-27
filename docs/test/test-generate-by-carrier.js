/**
 * Test script for /api/rates/generate/[carrierId] endpoint
 * Tests carrier-specific rate generation functionality
 */

const BASE_URL = 'http://localhost:3000'

async function testGenerateByCarrierId(carrierId) {
  console.log(`🧪 Testing Generate by Carrier ID: ${carrierId}`)
  console.log('===========================================\n')

  try {
    console.log(`📡 Making request to /api/rates/generate/${carrierId}...`)
    
    const response = await fetch(`${BASE_URL}/api/rates/generate/${carrierId}`, {
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
      console.log(`\n✅ SUCCESS - Generated rates for carrier ${carrierId}`)
      console.log(`   📍 Zones Processed: ${data.zones_processed}`)
      console.log(`   📈 Rates Generated: ${data.rates_generated}`)
      
      if (data.carrier_id && data.carrier_name) {
        console.log(`   🏢 Carrier: ${data.carrier_name} (ID: ${data.carrier_id})`)
      }
      
      if (data.errors && data.errors.length > 0) {
        console.log(`   ⚠️  Warnings: ${data.errors.join(', ')}`)
      }
    } else {
      console.log(`\n❌ FAILED - Rate generation failed for carrier ${carrierId}`)
      if (data.errors) {
        console.log(`   Errors: ${data.errors.join(', ')}`)
      }
    }
  } catch (error) {
    console.error('\n💥 REQUEST FAILED:', error.message)
  }
}

async function testInvalidCarrierId(invalidId) {
  console.log(`\n\n🧪 Testing Invalid Carrier ID: ${invalidId}`)
  console.log('=====================================\n')

  try {
    const response = await fetch(`${BASE_URL}/api/rates/generate/${invalidId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📋 Response Data:`)
    console.log(JSON.stringify(data, null, 2))
    
    if (response.status === 400) {
      console.log('\n✅ SUCCESS - Correctly rejected invalid carrier ID')
    } else {
      console.log('\n❌ UNEXPECTED - Should have returned 400 Bad Request')
    }
  } catch (error) {
    console.error('\n💥 REQUEST FAILED:', error.message)
  }
}

async function testInvalidMethod(carrierId) {
  console.log(`\n\n🧪 Testing Invalid Method (GET) for Carrier ${carrierId}`)
  console.log('===============================================\n')

  try {
    const response = await fetch(`${BASE_URL}/api/rates/generate/${carrierId}`, {
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
  console.log('🚀 Starting Carrier-Specific Rate Generation Tests')
  console.log('================================================\n')
  
  // Test with valid carrier ID (assuming carrier 1 exists - DHL from previous sessions)
  await testGenerateByCarrierId(1)
  
  // Test with another valid carrier ID if it exists
  await testGenerateByCarrierId(2)
  
  // Test invalid carrier IDs
  await testInvalidCarrierId('invalid')
  await testInvalidCarrierId(-1)
  await testInvalidCarrierId(0)
  
  // Test invalid method
  await testInvalidMethod(1)
  
  console.log('\n🏁 All tests completed!')
}

// Run tests
runAllTests().catch(console.error)
