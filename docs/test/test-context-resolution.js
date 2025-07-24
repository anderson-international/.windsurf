/**
 * Test script to verify the context resolution is working with our duplicate fix
 */
require('dotenv').config()

async function testContextResolution() {
  console.log('🔍 Testing Context Resolution with Duplicate Fix...\n')

  try {
    // Test fetching context directly
    console.log('📡 Testing context API endpoint...')
    
    const response = await fetch('http://localhost:3000/api/context', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Context API responded successfully')
      console.log(`   Status: ${response.status}`)
      
      if (data.data) {
        console.log(`   Found ${Object.keys(data.data).length} zone contexts`)
        
        // Check first zone for existing method definitions
        const firstZoneId = Object.keys(data.data)[0]
        const firstContext = data.data[firstZoneId]
        
        console.log(`\n📋 Sample Zone Context (${firstZoneId}):`)
        console.log(`   Profile ID: ${firstContext.profileId}`)
        console.log(`   Location Group ID: ${firstContext.locationGroupId}`)
        console.log(`   Zone ID: ${firstContext.zoneId}`)
        
        if (firstContext.existingMethodDefinitionIds) {
          console.log(`   Existing Method Definitions: ${firstContext.existingMethodDefinitionIds.length}`)
          if (firstContext.existingMethodDefinitionIds.length > 0) {
            console.log('   ✅ Fix working - found existing method definitions to delete')
            console.log(`   Sample IDs: ${firstContext.existingMethodDefinitionIds.slice(0, 3).join(', ')}`)
          } else {
            console.log('   📝 No existing method definitions found (first deployment or clean state)')
          }
        } else {
          console.log('   ❌ existingMethodDefinitionIds missing - fix not applied')
        }
      } else {
        console.log('   ⚠️  No context data returned')
      }
    } else {
      console.log(`❌ Context API Error: ${response.status}`)
      const errorText = await response.text()
      console.log(`   Error details: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Context resolution test failed:', error.message)
  }
}

testContextResolution()
