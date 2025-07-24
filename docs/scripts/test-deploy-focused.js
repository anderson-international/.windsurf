require('dotenv').config()

async function testDeployFocused() {
  console.log('🚀 Focused Deploy Test')
  console.log('=====================\n')

  try {
    const response = await fetch('http://localhost:3000/api/rates/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log(`📡 Status: ${response.status} ${response.statusText}`)
    console.log(`📄 Raw Response:`)
    console.log(responseText)
    
    try {
      const responseData = JSON.parse(responseText)
      console.log('\n📊 Parsed JSON:')
      console.log(JSON.stringify(responseData, null, 2))
      
      if (responseData.data?.errors) {
        console.log('\n❌ Deployment Errors:')
        responseData.data.errors.forEach((error, i) => {
          console.log(`   ${i+1}. ${error}`)
        })
      }

      if (responseData.data?.failed_zones) {
        console.log(`\n⚠️  Failed Zones: ${responseData.data.failed_zones.length}`)
      }

      console.log(`\n📈 Results:`)
      console.log(`   Success: ${responseData.data?.success}`)
      console.log(`   Deployed: ${responseData.data?.deployed_rates}`)
      console.log(`   Total: ${responseData.data?.total_rates}`)

    } catch (parseError) {
      console.log('\n❌ Could not parse response as JSON')
    }

  } catch (error) {
    console.log(`❌ Network error: ${error.message}`)
  }
}

testDeployFocused().catch(console.error)
