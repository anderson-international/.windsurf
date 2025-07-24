require('dotenv').config()

async function verifyGapFix() {
  console.log('🔍 Verifying 1.9-2.0kg Gap Fix')
  console.log('==============================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Test Zone 0 for the specific gap
    console.log('📋 Zone 0 rates around 1.9-2.0kg boundary:')
    const zone0Rates = await prisma.generated_rates.findMany({
      where: {
        zone_name: {
          contains: 'Zone 0'
        },
        weight_min: {
          gte: 1.7,
          lte: 2.2
        }
      },
      orderBy: {
        weight_min: 'asc'
      }
    })

    zone0Rates.forEach((rate, i) => {
      console.log(`   ${i+1}. ${rate.weight_min}kg → ${rate.weight_max}kg (tariff: $${rate.tariff})`)
    })

    // Test coverage for 1.95kg
    console.log('\n🎯 Testing 1.95kg coverage:')
    const covers195 = zone0Rates.filter(r => {
      const min = parseFloat(r.weight_min)
      const max = parseFloat(r.weight_max)
      return min <= 1.95 && max > 1.95
    })

    if (covers195.length === 0) {
      console.log('   ❌ GAP STILL EXISTS: 1.95kg not covered!')
      
      // Find the actual gap
      const beforeGap = zone0Rates.filter(r => parseFloat(r.weight_max) <= 1.95).slice(-1)[0]
      const afterGap = zone0Rates.filter(r => parseFloat(r.weight_min) >= 1.95)[0]
      
      if (beforeGap && afterGap) {
        console.log(`   Gap: ${beforeGap.weight_max}kg → ${afterGap.weight_min}kg`)
      }
    } else {
      const coveringRate = covers195[0]
      console.log(`   ✅ FIXED: 1.95kg covered by ${coveringRate.weight_min}kg → ${coveringRate.weight_max}kg`)
    }

    // Test all zones for systematic fix
    console.log('\n🌍 Testing all zones for boundary gaps:')
    const allZones = await prisma.generated_rates.findMany({
      select: {
        zone_name: true
      },
      distinct: ['zone_name']
    })

    for (const zone of allZones) {
      const zoneRates = await prisma.generated_rates.findMany({
        where: {
          zone_name: zone.zone_name,
          weight_min: {
            gte: 1.7,
            lte: 2.2
          }
        },
        orderBy: {
          weight_min: 'asc'
        }
      })

      const covers195 = zoneRates.filter(r => {
        const min = parseFloat(r.weight_min)
        const max = parseFloat(r.weight_max)
        return min <= 1.95 && max > 1.95
      })

      if (covers195.length === 0) {
        console.log(`   ❌ ${zone.zone_name}: Still has 1.9-2.0kg gap`)
      } else {
        console.log(`   ✅ ${zone.zone_name}: Gap fixed (${covers195[0].weight_min}kg → ${covers195[0].weight_max}kg)`)
      }
    }

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  verifyGapFix()
}

module.exports = { verifyGapFix }
