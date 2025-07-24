require('dotenv').config()

async function checkAllZone0Rates() {
  console.log('🔍 Complete Zone 0 Database Query Test')
  console.log('======================================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Check what zone names exist
    console.log('📋 All unique zone names in database:')
    const allZones = await prisma.generated_rates.findMany({
      select: {
        zone_name: true,
        zone_id: true
      },
      distinct: ['zone_name']
    })

    allZones.forEach((zone, i) => {
      console.log(`   ${i+1}. Zone ID: ${zone.zone_id}, Name: "${zone.zone_name}"`)
    })

    // Try different Zone 0 queries
    console.log('\n🔎 Testing different Zone 0 queries:\n')

    // Query 1: Contains 'Zone 0'
    const query1 = await prisma.generated_rates.findMany({
      where: {
        zone_name: {
          contains: 'Zone 0'
        }
      },
      orderBy: {
        weight_min: 'asc'
      }
    })
    console.log(`Query 1 (contains 'Zone 0'): Found ${query1.length} rates`)

    // Query 2: Exact match 'Zone 0'
    const query2 = await prisma.generated_rates.findMany({
      where: {
        zone_name: 'Zone 0'
      },
      orderBy: {
        weight_min: 'asc'
      }
    })
    console.log(`Query 2 (exact 'Zone 0'): Found ${query2.length} rates`)

    // Query 3: Zone ID = 0
    const query3 = await prisma.generated_rates.findMany({
      where: {
        zone_id: 0
      },
      orderBy: {
        weight_min: 'asc'
      }
    })
    console.log(`Query 3 (zone_id = 0): Found ${query3.length} rates`)

    // Query 4: Zone ID = '0' (string)
    const query4 = await prisma.generated_rates.findMany({
      where: {
        zone_id: '0'
      },
      orderBy: {
        weight_min: 'asc'
      }
    })
    console.log(`Query 4 (zone_id = '0'): Found ${query4.length} rates`)

    // Use the query that finds the most rates
    const allZone0Rates = query1.length > 0 ? query1 : 
                         query2.length > 0 ? query2 : 
                         query3.length > 0 ? query3 : query4

    if (allZone0Rates.length === 0) {
      console.log('\n❌ No Zone 0 rates found with any query!')
      await prisma.$disconnect()
      return
    }

    console.log(`\n📊 Using best query result: ${allZone0Rates.length} Zone 0 rates found`)

    // Show all rates with focus on the 2kg boundary
    console.log('\n📋 ALL Zone 0 Rates:')
    console.log('====================')

    let previousPrice = 0
    let largeJumps = []

    allZone0Rates.forEach((rate, i) => {
      const price = parseFloat(rate.calculated_price)
      const jump = i > 0 ? price - previousPrice : 0
      const percentJump = previousPrice > 0 ? (jump / previousPrice * 100) : 0

      console.log(`   ${String(i+1).padStart(2)}. ${rate.weight_min}kg → ${rate.weight_max}kg | Tariff: £${rate.tariff} | Price: £${rate.calculated_price}`)

      // Detect large price jumps (>50% increase)
      if (jump > previousPrice * 0.5 && previousPrice > 0) {
        largeJumps.push({
          index: i + 1,
          from: previousPrice.toFixed(2),
          to: price.toFixed(2),
          jump: jump.toFixed(2),
          percent: percentJump.toFixed(1),
          weightRange: `${rate.weight_min}kg → ${rate.weight_max}kg`
        })
        console.log(`       ⚠️  LARGE JUMP: +£${jump.toFixed(2)} (+${percentJump.toFixed(1)}%)`)
      }

      previousPrice = price
    })

    // Summary of price jumps
    console.log('\n🚨 Price Jump Analysis:')
    console.log('=======================')

    if (largeJumps.length === 0) {
      console.log('   ✅ No large price jumps detected')
    } else {
      console.log(`   ❌ Found ${largeJumps.length} large price jump(s):`)
      largeJumps.forEach((jump, i) => {
        console.log(`   ${i+1}. Rate ${jump.index}: ${jump.weightRange}`)
        console.log(`      £${jump.from} → £${jump.to} (+£${jump.jump}, +${jump.percent}%)`)
      })

      // Identify the most problematic jump
      const maxJump = largeJumps.reduce((max, jump) => 
        parseFloat(jump.jump) > parseFloat(max.jump) ? jump : max
      )
      console.log(`\n   🎯 LARGEST JUMP: Rate ${maxJump.index} (+£${maxJump.jump}, +${maxJump.percent}%)`)
    }

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  checkAllZone0Rates()
}

module.exports = { checkAllZone0Rates }
