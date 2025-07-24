/**
 * Simple verification script for the duplicate prevention fix
 */
require('dotenv').config()

async function verifyDuplicateFix() {
  console.log('🔍 Verifying Duplicate Prevention Fix Implementation...\n')

  try {
    // Test the API endpoint once
    console.log('📡 Testing deployment endpoint...')
    
    const response = await fetch('http://localhost:3000/api/rates/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Deployment API responded successfully')
      console.log(`   Status: ${response.status}`)
      
      if (data.data?.success) {
        console.log(`   Deployed: ${data.data.deployed_rates} rates`)
        console.log(`   Total rates: ${data.data.total_rates}`)
        console.log(`   Failed zones: ${data.data.failed_zones?.length || 0}`)
        console.log('   ✅ Fix appears to be working (no compilation errors)')
      } else {
        console.log('   ⚠️  Deployment returned error:', data.error)
      }
    } else {
      console.log(`❌ API Error: ${response.status}`)
      const errorText = await response.text()
      console.log(`   Error details: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

verifyDuplicateFix()
