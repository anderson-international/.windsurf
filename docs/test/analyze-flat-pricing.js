require('dotenv').config()

async function analyzeFlatPricing() {
  console.log('🔍 Zone 0 Flat Pricing Bug Analysis')
  console.log('===================================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Get ALL Zone 0 rates
    const allZone0Rates = await prisma.generated_rates.findMany({
      where: {
        zone_name: 'Zone 0'
      },
      orderBy: {
        weight_min: 'asc'
      }
    })

    console.log(`📊 Found ${allZone0Rates.length} Zone 0 rates`)

    // Focus on parcel 2 rates (around 2kg+)
    console.log('\n🔍 Analyzing Parcel 2 Rates (2kg+ range):')
    console.log('==========================================')

    const parcel2Rates = allZone0Rates.filter(rate => 
      parseFloat(rate.weight_min) >= 2.0 && parseFloat(rate.weight_min) < 4.0
    )

    console.log(`Found ${parcel2Rates.length} rates in 2kg-4kg range:\n`)

    let flatPricingDetected = false
    let firstPrice = null
    let flatCount = 0

    parcel2Rates.forEach((rate, i) => {
      const price = parseFloat(rate.calculated_price)
      const tariff = parseFloat(rate.tariff)
      
      console.log(`   ${String(i+1).padStart(2)}. ${rate.weight_min}kg → ${rate.weight_max}kg | Tariff: £${rate.tariff} | Price: £${rate.calculated_price}`)

      if (i === 0) {
        firstPrice = price
      } else {
        // Check if price is exactly the same
        if (Math.abs(price - firstPrice) < 0.01) {
          flatCount++
          if (!flatPricingDetected) {
            console.log(`       ⚠️  FLAT PRICING DETECTED: Same as first rate (£${firstPrice})`)
            flatPricingDetected = true
          }
        } else {
          console.log(`       ✅ Price properly increased from £${firstPrice}`)
        }
      }
    })

    // Analyze tariff vs calculated_price relationship
    console.log('\n📈 Tariff vs Calculated Price Analysis:')
    console.log('=======================================')

    console.log('Expected relationship: calculated_price = tariff * (1 + margin)')
    console.log('Checking if margin is being applied correctly...\n')

    let marginInconsistencies = 0

    parcel2Rates.slice(0, 10).forEach((rate, i) => {
      const tariff = parseFloat(rate.tariff)
      const calculatedPrice = parseFloat(rate.calculated_price)
      const impliedMargin = ((calculatedPrice / tariff) - 1) * 100

      console.log(`   ${i+1}. ${rate.weight_min}kg: Tariff £${tariff} → Price £${calculatedPrice} (${impliedMargin.toFixed(1)}% margin)`)

      // Check if margin is consistent (should be around 20%)
      if (Math.abs(impliedMargin - 20) > 1) {
        console.log(`       ❌ MARGIN ISSUE: Expected ~20%, got ${impliedMargin.toFixed(1)}%`)
        marginInconsistencies++
      }
    })

    // Summary
    console.log('\n📋 DIAGNOSIS:')
    console.log('=============')

    if (flatPricingDetected) {
      console.log(`❌ FLAT PRICING BUG CONFIRMED:`)
      console.log(`   - ${flatCount}/${parcel2Rates.length} rates have identical pricing`)
      console.log(`   - All rates stuck at £${firstPrice}`)
      console.log(`   - Tariffs are changing correctly, but calculated_price is not`)
    } else {
      console.log('✅ No flat pricing detected - prices are increasing correctly')
    }

    if (marginInconsistencies > 0) {
      console.log(`❌ MARGIN APPLICATION ISSUES: ${marginInconsistencies} inconsistencies detected`)
    } else {
      console.log('✅ Margin application appears consistent')
    }

    // Check if this affects other parcels too
    console.log('\n🔍 Checking other parcel ranges:')
    console.log('================================')

    const parcel3Rates = allZone0Rates.filter(rate => 
      parseFloat(rate.weight_min) >= 4.0 && parseFloat(rate.weight_min) < 6.0
    )

    const parcel4Rates = allZone0Rates.filter(rate => 
      parseFloat(rate.weight_min) >= 6.0
    )

    console.log(`Parcel 3 rates (4kg+): ${parcel3Rates.length} found`)
    console.log(`Parcel 4 rates (6kg+): ${parcel4Rates.length} found`)

    // Quick check if other parcels have same issue
    if (parcel3Rates.length > 1) {
      const parcel3First = parseFloat(parcel3Rates[0].calculated_price)
      const parcel3Flat = parcel3Rates.every(rate => 
        Math.abs(parseFloat(rate.calculated_price) - parcel3First) < 0.01
      )
      console.log(`Parcel 3 flat pricing: ${parcel3Flat ? '❌ YES' : '✅ NO'}`)
    }

    if (parcel4Rates.length > 1) {
      const parcel4First = parseFloat(parcel4Rates[0].calculated_price)
      const parcel4Flat = parcel4Rates.every(rate => 
        Math.abs(parseFloat(rate.calculated_price) - parcel4First) < 0.01
      )
      console.log(`Parcel 4 flat pricing: ${parcel4Flat ? '❌ YES' : '✅ NO'}`)
    }

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  analyzeFlatPricing()
}

module.exports = { analyzeFlatPricing }
