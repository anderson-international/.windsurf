require('dotenv').config()

async function regenerateRates() {
  console.log('🔄 Regenerating All Shipping Rates')
  console.log('==================================\n')

  try {
    console.log('📡 Calling /api/rates/generate endpoint...')
    
    const response = await fetch('http://localhost:3000/api/rates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('\n✅ Generation Response:')
      console.log(JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.log('\n❌ Invalid JSON Response:')
      console.log(responseText)
      process.exit(1)
    }

    if (!response.ok) {
      console.log('\n💥 Generation failed!')
      process.exit(1)
    }

    // Analyze the results
    console.log('\n📈 Generation Results:')
    console.log(`   Success: ${responseData.data?.success}`)
    console.log(`   Zones Processed: ${responseData.data?.zones_processed}`)
    console.log(`   Rates Generated: ${responseData.data?.rates_generated}`)
    
    if (responseData.data?.errors?.length > 0) {
      console.log('\n❌ Errors During Generation:')
      responseData.data.errors.forEach((error, i) => {
        console.log(`   ${i+1}. ${error}`)
      })
    }

    if (responseData.data?.success) {
      console.log('\n🎉 Rates successfully regenerated!')
      console.log('\n🔍 Now testing for the 1.9-2.0kg gap fix...')
      
      // Quick verification of the fix
      await verifyGapFix()
    }

  } catch (error) {
    console.error('\n💥 Network error:', error.message)
    process.exit(1)
  }
}

async function verifyGapFix() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    console.log('🔎 Checking if 1.9-2.0kg gap is fixed...')
    
    // Test Zone 0 for the specific gap
    const zone0Rates = await prisma.generated_rates.findMany({
      where: {
        zone_name: {
          contains: 'Zone 0'
        },
        weight_min: {
          gte: 1.8,
          lte: 2.1
        }
      },
      orderBy: {
        weight_min: 'asc'
      }
    })

    console.log('\n📋 Zone 0 rates around 1.9-2.0kg boundary:')
    zone0Rates.forEach((rate, i) => {
      console.log(`   ${i+1}. ${rate.weight_min}kg → ${rate.weight_max}kg`)
    })

    // Test coverage for 1.95kg
    const covers195 = zone0Rates.filter(r => {
      const min = parseFloat(r.weight_min)
      const max = parseFloat(r.weight_max)
      return min <= 1.95 && max > 1.95
    })

    if (covers195.length === 0) {
      console.log('\n❌ GAP STILL EXISTS: 1.95kg not covered!')
      console.log('   The fix may not have worked properly.')
    } else {
      const coveringRate = covers195[0]
      console.log(`\n✅ GAP FIXED: 1.95kg now covered by ${coveringRate.weight_min}kg → ${coveringRate.weight_max}kg`)
      console.log('   🎉 The weight range fix is working!')
    }

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Gap verification failed:', error.message)
  }
}

if (require.main === module) {
  regenerateRates()
}

module.exports = { regenerateRates }
