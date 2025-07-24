/**
 * Debug Script: Zone Deploy Endpoint
 * 
 * Tests the zone-specific deployment endpoint step by step to isolate issues
 */

const TEST_ZONE_ID = 'gid://shopify/DeliveryZone/302956413135' // Zone 1

async function testEndpointConnection() {
  console.log('🔍 Testing endpoint connectivity...')
  
  try {
    const response = await fetch('http://localhost:3000/api/rates/deploy-zone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone_id: TEST_ZONE_ID
      })
    })
    
    console.log(`Response status: ${response.status} ${response.statusText}`)
    
    const text = await response.text()
    console.log('Response body:', text)
    
    try {
      const json = JSON.parse(text)
      console.log('Parsed JSON:', JSON.stringify(json, null, 2))
    } catch (e) {
      console.log('Failed to parse as JSON')
    }
    
  } catch (error) {
    console.error('Connection error:', error.message)
  }
}

async function testInvalidZoneId() {
  console.log('\n🔍 Testing invalid zone ID handling...')
  
  try {
    const response = await fetch('http://localhost:3000/api/rates/deploy-zone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone_id: 'invalid-zone-id'
      })
    })
    
    console.log(`Response status: ${response.status} ${response.statusText}`)
    
    const json = await response.json()
    console.log('Response:', JSON.stringify(json, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

async function testMissingZoneId() {
  console.log('\n🔍 Testing missing zone_id handling...')
  
  try {
    const response = await fetch('http://localhost:3000/api/rates/deploy-zone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })
    
    console.log(`Response status: ${response.status} ${response.statusText}`)
    
    const json = await response.json()
    console.log('Response:', JSON.stringify(json, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

async function runDebugTests() {
  console.log('🚀 Starting Zone Deploy Debug Tests')
  console.log('=' .repeat(50))
  
  await testEndpointConnection()
  await testInvalidZoneId()
  await testMissingZoneId()
  
  console.log('\n' + '=' .repeat(50))
  console.log('Debug tests completed')
}

runDebugTests().catch(console.error)
