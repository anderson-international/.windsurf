/**
 * Generate Carrier-Specific Rates
 * 
 * Script to generate shipping rates for a specific carrier.
 * Makes a POST request to the /api/rates/generate/[carrierId] endpoint.
 * 
 * Usage: node scripts/generate-carrier-rates.js [carrierId]
 * Example: node scripts/generate-carrier-rates.js 1
 */

const BASE_URL = 'http://localhost:3000'

async function generateCarrierRates(carrierId) {
  console.log(`🧪 Generating Rates for Carrier ID: ${carrierId}`)
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

// Get carrier ID from command line arguments
const carrierId = process.argv[2]

if (!carrierId) {
  console.error('❌ Error: Missing carrier ID')
  console.log('Usage: node generate-carrier-rates.js [carrierId]')
  console.log('Example: node generate-carrier-rates.js 1')
  process.exit(1)
}

// Run the script
generateCarrierRates(carrierId).catch(console.error)
