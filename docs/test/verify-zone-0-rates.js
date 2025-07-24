require('dotenv').config()

async function verifyZone0Rates() {
  console.log('🔍 Zone 0 Rate Verification Test')
  console.log('================================\n')

  try {
    // Expected values from CSV file (first 10 rows for testing)
    const expectedRates = [
      { weight: 0.05, tariff: 7.14, price: 8.57 },
      { weight: 0.10, tariff: 7.19, price: 8.63 },
      { weight: 0.15, tariff: 7.23, price: 8.68 },
      { weight: 0.20, tariff: 7.27, price: 8.72 },
      { weight: 0.25, tariff: 7.32, price: 8.78 },
      { weight: 0.30, tariff: 7.36, price: 8.83 },
      { weight: 0.35, tariff: 7.40, price: 8.88 },
      { weight: 0.40, tariff: 7.44, price: 8.93 },
      { weight: 0.45, tariff: 7.49, price: 8.99 },
      { weight: 0.50, tariff: 7.53, price: 9.04 }
    ]

    console.log('📊 Expected Zone 0 Rates (from CSV):')
    expectedRates.forEach((rate, i) => {
      console.log(`   ${i+1}. Weight: ${rate.weight}kg → Tariff: £${rate.tariff}, Price: £${rate.price}`)
    })

    // Fetch generated rates from database
    console.log('\n📡 Fetching generated rates from database...')
    const response = await fetch('http://localhost:3000/api/rates/count')
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const ratesResult = await response.json()
    console.log(`✅ Found ${ratesResult.generated_rates} total generated rates\n`)

    // Get Zone 0 specific rates - need to query database directly
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    console.log('🔎 Querying Zone 0 rates from database...')
    
    const zone0Rates = await prisma.generated_rates.findMany({
      where: {
        zone_name: {
          contains: 'Zone 0'
        }
      },
      orderBy: {
        weight_min: 'asc'
      },
      take: 10 // First 10 rates for comparison
    })

    if (zone0Rates.length === 0) {
      console.log('❌ No Zone 0 rates found in database')
      console.log('   Available zone names in database:')
      
      const sampleRates = await prisma.generated_rates.findMany({
        select: { zone_name: true },
        distinct: ['zone_name'],
        take: 10
      })
      
      sampleRates.forEach(rate => console.log(`   - ${rate.zone_name}`))
      await prisma.$disconnect()
      return
    }

    console.log(`📋 Found ${zone0Rates.length} Zone 0 rates in database:\n`)

    // Compare actual vs expected
    console.log('📋 Found', zone0Rates.length, 'Zone 0 rates in database:')

    console.log('\n🔍 Verification Results:')
    console.log('========================')
    
    let mismatches = 0
    
    // First verify against the 10 expected CSV rates
    console.log('\n📊 CSV Comparison (First 10 rates):')
    for (let i = 0; i < Math.min(expectedRates.length, zone0Rates.length); i++) {
      const expected = expectedRates[i]
      const actual = zone0Rates[i]
      
      console.log(`\n📦 Rate ${i+1} (Weight: ${expected.weight}kg):`)
      console.log(`   Expected: Tariff £${expected.tariff}, Price £${expected.price}`)
      console.log(`   Actual:   Tariff £${actual.tariff}, Price £${actual.calculated_price}`)
      
      const tariffMatch = Math.abs(parseFloat(actual.tariff) - expected.tariff) < 0.01
      const priceMatch = Math.abs(parseFloat(actual.calculated_price) - expected.price) < 0.01
      
      if (tariffMatch && priceMatch) {
        console.log(`   ✅ MATCH - All values correct`)
      } else {
        console.log(`   ❌ MISMATCH:`)
        if (!tariffMatch) {
          const tariffDiff = (parseFloat(actual.tariff) - expected.tariff).toFixed(2)
          console.log(`      - Tariff off by £${tariffDiff}`)
        }
        if (!priceMatch) {
          const priceDiff = (parseFloat(actual.calculated_price) - expected.price).toFixed(2)
          console.log(`      - Price off by £${priceDiff}`)
        }
        mismatches++
      }
    }

    console.log('\n📈 CSV Comparison Summary:')
    console.log(`   Total rates compared: ${Math.min(expectedRates.length, zone0Rates.length)}`)
    console.log(`   Mismatches found: ${mismatches}`)
    
    if (mismatches === 0) {
      console.log('   ✅ All CSV rates match perfectly!')
    } else {
      console.log('   ❌ Issues found in CSV comparison!')
    }

    // Now analyze ALL Zone 0 rates for patterns
    console.log('\n\n🔍 COMPLETE Zone 0 Rate Analysis:')
    console.log('==================================')
    console.log(`Total Zone 0 rates in database: ${zone0Rates.length}`)
    
    // Show all rates with focus on 2kg boundary issue
    console.log('\n📋 All Zone 0 Rates:')
    let previousPrice = 0
    let largeJumps = []
    
    zone0Rates.forEach((rate, i) => {
      const price = parseFloat(rate.calculated_price)
      const jump = i > 0 ? price - previousPrice : 0
      
      console.log(`   ${String(i+1).padStart(2)}. ${rate.weight_min}kg → ${rate.weight_max}kg | Tariff: £${rate.tariff} | Price: £${rate.calculated_price}`)
      
      // Detect large price jumps (>50% increase)
      if (jump > previousPrice * 0.5 && previousPrice > 0) {
        largeJumps.push({
          index: i,
          from: previousPrice.toFixed(2),
          to: price.toFixed(2),
          jump: jump.toFixed(2),
          weightRange: `${rate.weight_min}kg → ${rate.weight_max}kg`
        })
        console.log(`     ⚠️  LARGE JUMP: +£${jump.toFixed(2)} (+${(jump/previousPrice*100).toFixed(1)}%)`)
      }
      
      previousPrice = price
    })
    
    // Analyze price jumps
    console.log('\n🚨 Price Jump Analysis:')
    console.log('=======================')
    
    if (largeJumps.length === 0) {
      console.log('   ✅ No unusual price jumps detected')
    } else {
      console.log(`   ❌ Found ${largeJumps.length} large price jump(s):`)
      largeJumps.forEach((jump, i) => {
        console.log(`   ${i+1}. At ${jump.weightRange}: £${jump.from} → £${jump.to} (+£${jump.jump})`)
      })
    }
    
    // Check for parcel boundary transitions
    console.log('\n🔄 Parcel Boundary Analysis:')
    console.log('============================')
    
    // Look for transitions at 2kg, 4kg, 6kg boundaries
    const boundaries = [2.0, 4.0, 6.0]
    boundaries.forEach(boundary => {
      const beforeBoundary = zone0Rates.filter(r => parseFloat(r.weight_max) <= boundary).slice(-1)[0]
      const afterBoundary = zone0Rates.filter(r => parseFloat(r.weight_min) >= boundary)[0]
      
      if (beforeBoundary && afterBoundary) {
        const priceBefore = parseFloat(beforeBoundary.calculated_price)
        const priceAfter = parseFloat(afterBoundary.calculated_price)
        const jump = priceAfter - priceBefore
        const percentJump = (jump / priceBefore * 100)
        
        console.log(`\n   ${boundary}kg boundary:`)
        console.log(`     Before: ${beforeBoundary.weight_min}kg-${beforeBoundary.weight_max}kg = £${beforeBoundary.calculated_price}`)
        console.log(`     After:  ${afterBoundary.weight_min}kg-${afterBoundary.weight_max}kg = £${afterBoundary.calculated_price}`)
        console.log(`     Jump:   +£${jump.toFixed(2)} (+${percentJump.toFixed(1)}%)`)
        
        if (percentJump > 50) {
          console.log(`     ⚠️  SUSPICIOUS: Jump exceeds 50%`)
        } else {
          console.log(`     ✅ Normal transition`)
        }
      }
    })

    await prisma.$disconnect()

  } catch (error) {
    console.error('\n💥 Test failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  verifyZone0Rates()
}

module.exports = { verifyZone0Rates }
