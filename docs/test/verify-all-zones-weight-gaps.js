require('dotenv').config()

async function verifyAllZonesWeightGaps() {
  console.log('🌍 Multi-Zone Weight Gap Verification')
  console.log('====================================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    console.log('🔎 Getting all available zones...')
    
    // Get all unique zone names
    const zones = await prisma.generated_rates.findMany({
      select: { zone_name: true },
      distinct: ['zone_name'],
      orderBy: { zone_name: 'asc' }
    })

    console.log(`📋 Found ${zones.length} zones:\n`)
    zones.forEach((zone, i) => {
      console.log(`   ${i+1}. ${zone.zone_name}`)
    })

    console.log('\n⚖️  Checking 1.9kg-2.0kg gap across all zones...\n')

    let zonesWithGaps = []
    let zonesWithoutGaps = []

    for (const zone of zones) {
      console.log(`🔍 Checking ${zone.zone_name}:`)
      
      // Get rates around 2kg boundary for this zone
      const rates = await prisma.generated_rates.findMany({
        where: {
          zone_name: zone.zone_name,
          weight_min: {
            gte: 1.5,
            lte: 2.5
          }
        },
        orderBy: {
          weight_min: 'asc'
        }
      })

      if (rates.length === 0) {
        console.log(`   ⚠️  No rates found in 1.5-2.5kg range\n`)
        continue
      }

      // Check for the specific 1.9-2.0kg gap
      const rate19 = rates.find(r => Math.abs(parseFloat(r.weight_min) - 1.9) < 0.001)
      const rate20 = rates.find(r => Math.abs(parseFloat(r.weight_min) - 2.0) < 0.001)
      
      // Test if 1.95kg is covered
      const covering195 = rates.filter(r => {
        const min = parseFloat(r.weight_min)
        const max = parseFloat(r.weight_max)
        return min <= 1.95 && max > 1.95
      })

      const hasGap = covering195.length === 0
      
      if (hasGap) {
        zonesWithGaps.push(zone.zone_name)
        console.log(`   ❌ GAP FOUND: 1.95kg not covered`)
        
        // Show the gap details
        const before19 = rates.filter(r => parseFloat(r.weight_max) <= 1.95).slice(-1)[0]
        const after19 = rates.filter(r => parseFloat(r.weight_min) >= 1.95)[0]
        
        if (before19 && after19) {
          console.log(`      Last rate before gap: ${before19.weight_min}kg → ${before19.weight_max}kg`)
          console.log(`      Next rate after gap: ${after19.weight_min}kg → ${after19.weight_max}kg`)
          console.log(`      Gap size: ${(parseFloat(after19.weight_min) - parseFloat(before19.weight_max)).toFixed(3)}kg`)
        }
      } else {
        zonesWithoutGaps.push(zone.zone_name)
        const coveringRate = covering195[0]
        console.log(`   ✅ NO GAP: 1.95kg covered by ${coveringRate.weight_min}kg → ${coveringRate.weight_max}kg`)
      }
      
      console.log('')
    }

    console.log('📊 SUMMARY RESULTS:')
    console.log('==================\n')

    console.log(`🚨 Zones WITH 1.9-2.0kg gaps (${zonesWithGaps.length}):`)
    if (zonesWithGaps.length === 0) {
      console.log('   None - all zones have proper coverage')
    } else {
      zonesWithGaps.forEach((zoneName, i) => {
        console.log(`   ${i+1}. ${zoneName}`)
      })
    }

    console.log(`\n✅ Zones WITHOUT gaps (${zonesWithoutGaps.length}):`)
    if (zonesWithoutGaps.length === 0) {
      console.log('   None - all zones have gaps!')
    } else {
      zonesWithoutGaps.forEach((zoneName, i) => {
        console.log(`   ${i+1}. ${zoneName}`)
      })
    }

    console.log('\n🎯 ANALYSIS:')
    console.log('============')
    
    const totalZones = zones.length
    const gapPercentage = ((zonesWithGaps.length / totalZones) * 100).toFixed(1)
    
    console.log(`   Total zones analyzed: ${totalZones}`)
    console.log(`   Zones with gaps: ${zonesWithGaps.length} (${gapPercentage}%)`)
    console.log(`   Zones without gaps: ${zonesWithoutGaps.length} (${(100 - parseFloat(gapPercentage)).toFixed(1)}%)`)

    if (zonesWithGaps.length === totalZones) {
      console.log('\n🚨 CRITICAL: ALL zones have the 1.9-2.0kg gap!')
      console.log('   This is a SYSTEMATIC issue in the rate generation algorithm.')
      console.log('   IMMEDIATE FIX REQUIRED - affects ALL shipping zones!')
    } else if (zonesWithGaps.length > 0) {
      console.log('\n⚠️  PARTIAL ISSUE: Some zones have gaps, others don\'t.')
      console.log('   This suggests zone-specific generation logic problems.')
    } else {
      console.log('\n🎉 GOOD NEWS: No zones have the 1.9-2.0kg gap!')
      console.log('   The rate generation appears to be working correctly.')
    }

    await prisma.$disconnect()

  } catch (error) {
    console.error('\n💥 Test failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  verifyAllZonesWeightGaps()
}

module.exports = { verifyAllZonesWeightGaps }
