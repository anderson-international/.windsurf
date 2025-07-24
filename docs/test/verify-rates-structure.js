/**
 * Test script to verify the rates structure and check for our duplicate fix implementation
 */
require('dotenv').config()

async function verifyRatesStructure() {
  console.log('🔍 Verifying Rates Structure and Duplicate Fix...\n')

  try {
    console.log('📡 Testing GET /api/shipping-rates endpoint...')
    
    const response = await fetch('http://localhost:3000/api/shipping-rates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Shipping rates API responded successfully')
      console.log(`   Status: ${response.status}`)
      
      if (data.success && data.data) {
        console.log(`   Total rates: ${data.meta?.total || data.data.length}`)
        
        if (data.data.length > 0) {
          console.log('\n📋 Sample Rate Structure:')
          const sampleRate = data.data[0]
          Object.keys(sampleRate).forEach(key => {
            console.log(`   ${key}: ${sampleRate[key]}`)
          })
          
          // Check for potential duplicates by rate title/zone combination
          console.log('\n🔍 Checking for duplicate rate titles per zone...')
          const zoneRates = {}
          
          data.data.forEach(rate => {
            const zoneId = rate.zoneId || rate.zone_id || 'unknown'
            if (!zoneRates[zoneId]) {
              zoneRates[zoneId] = []
            }
            zoneRates[zoneId].push(rate.title || rate.rate_title)
          })
          
          let duplicatesFound = false
          Object.keys(zoneRates).forEach(zoneId => {
            const titles = zoneRates[zoneId]
            const uniqueTitles = [...new Set(titles)]
            
            if (titles.length !== uniqueTitles.length) {
              duplicatesFound = true
              console.log(`   ⚠️  Zone ${zoneId}: ${titles.length} rates, ${uniqueTitles.length} unique titles`)
            }
          })
          
          if (!duplicatesFound) {
            console.log('   ✅ No duplicate rate titles detected in current rates')
          }
          
        } else {
          console.log('   📝 No rates found in system')
        }
      } else {
        console.log('   ⚠️  API returned error:', data.error)
      }
    } else {
      console.log(`❌ Rates API Error: ${response.status}`)
      const errorText = await response.text()
      console.log(`   Error details: ${errorText.slice(0, 200)}...`)
    }

  } catch (error) {
    console.error('❌ Rates structure verification failed:', error.message)
  }
}

verifyRatesStructure()
