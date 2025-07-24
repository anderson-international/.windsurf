require('dotenv').config()

async function verifyWeightIncrements() {
  console.log('⚖️  Weight Increment Verification Test')
  console.log('====================================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    console.log('🔎 Querying Zone 0 rates around 2kg boundary...')
    
    // Get rates around 2kg boundary (1.5kg to 2.5kg range)
    const zone0Rates = await prisma.generated_rates.findMany({
      where: {
        zone_name: {
          contains: 'Zone 0'
        },
        weight_min: {
          gte: 1.5,
          lte: 2.5
        }
      },
      orderBy: {
        weight_min: 'asc'
      }
    })

    console.log(`📋 Found ${zone0Rates.length} rates in 1.5-2.5kg range:\n`)

    if (zone0Rates.length === 0) {
      console.log('❌ No rates found in the specified range')
      await prisma.$disconnect()
      return
    }

    // Display all rates in the range
    console.log('📦 Weight Ranges Around 2kg Boundary:')
    console.log('====================================')
    
    let gaps = []
    let previousMax = null

    zone0Rates.forEach((rate, i) => {
      const weightMin = parseFloat(rate.weight_min)
      const weightMax = parseFloat(rate.weight_max) 
      
      console.log(`${i+1}. ${weightMin}kg → ${weightMax}kg | Tariff: £${rate.tariff} | Price: £${rate.calculated_price}`)
      
      // Check for gaps
      if (previousMax !== null && Math.abs(weightMin - previousMax) > 0.001) {
        gaps.push({
          gapStart: previousMax,
          gapEnd: weightMin,
          gapSize: (weightMin - previousMax).toFixed(3)
        })
      }
      
      previousMax = weightMax
    })

    // Report gaps
    console.log('\n🔍 Gap Analysis:')
    console.log('================')
    
    if (gaps.length === 0) {
      console.log('✅ No gaps found - weight ranges are continuous')
    } else {
      console.log(`❌ Found ${gaps.length} gap(s):`)
      gaps.forEach((gap, i) => {
        console.log(`   ${i+1}. Gap: ${gap.gapStart}kg to ${gap.gapEnd}kg (${gap.gapSize}kg missing)`)
      })
    }

    // Check specific 1.9 -> 2.0 transition
    console.log('\n🎯 Specific Check: 1.9kg → 2.0kg Transition:')
    console.log('==============================================')
    
    const rate19 = zone0Rates.find(r => Math.abs(parseFloat(r.weight_min) - 1.9) < 0.001)
    const rate20 = zone0Rates.find(r => Math.abs(parseFloat(r.weight_min) - 2.0) < 0.001)
    
    if (rate19) {
      console.log(`✅ Found 1.9kg rate: ${rate19.weight_min}kg → ${rate19.weight_max}kg`)
    } else {
      console.log(`❌ Missing 1.9kg rate`)
    }
    
    if (rate20) {
      console.log(`✅ Found 2.0kg rate: ${rate20.weight_min}kg → ${rate20.weight_max}kg`)
    } else {
      console.log(`❌ Missing 2.0kg rate`)
    }

    // Check what covers 1.95kg
    console.log('\n🔬 Coverage Test for 1.95kg:')
    console.log('============================')
    
    const covering195 = zone0Rates.filter(r => {
      const min = parseFloat(r.weight_min)
      const max = parseFloat(r.weight_max)
      return min <= 1.95 && max > 1.95
    })
    
    if (covering195.length === 0) {
      console.log('❌ No rate covers 1.95kg - this is a gap!')
    } else if (covering195.length === 1) {
      const rate = covering195[0]
      console.log(`✅ 1.95kg covered by: ${rate.weight_min}kg → ${rate.weight_max}kg`)
    } else {
      console.log(`⚠️  Multiple rates cover 1.95kg (overlap issue):`)
      covering195.forEach(rate => {
        console.log(`   - ${rate.weight_min}kg → ${rate.weight_max}kg`)
      })
    }

    // Get complete weight increment pattern
    console.log('\n📏 Weight Increment Pattern Analysis:')
    console.log('====================================')
    
    const increments = []
    for (let i = 1; i < zone0Rates.length; i++) {
      const prev = parseFloat(zone0Rates[i-1].weight_min)
      const curr = parseFloat(zone0Rates[i].weight_min)
      const increment = (curr - prev).toFixed(3)
      increments.push(parseFloat(increment))
      
      if (i <= 10) { // Show first 10 increments
        console.log(`   Step ${i}: ${prev}kg → ${curr}kg (increment: +${increment}kg)`)
      }
    }

    // Analyze increment consistency
    const uniqueIncrements = [...new Set(increments)]
    console.log(`\n📊 Increment Summary:`)
    console.log(`   Total increments: ${increments.length}`)
    console.log(`   Unique increment values: ${uniqueIncrements.length}`)
    console.log(`   Increment values: ${uniqueIncrements.map(i => `${i}kg`).join(', ')}`)

    await prisma.$disconnect()

  } catch (error) {
    console.error('\n💥 Test failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  verifyWeightIncrements()
}

module.exports = { verifyWeightIncrements }
