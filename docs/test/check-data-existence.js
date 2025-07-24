/**
 * Quick verification to check if any data exists in our key tables
 */

const { PrismaClient } = require('@prisma/client')

async function checkDataExistence() {
  const prisma = new PrismaClient()
  console.log('🔍 Checking basic data existence...\n')

  try {
    // Check total counts
    const generatedCount = await prisma.generated_rates.count()
    const tariffCount = await prisma.zone_tariffs.count()
    const carrierCount = await prisma.carriers.count()

    console.log('📊 Basic table counts:')
    console.log(`   Generated rates: ${generatedCount}`)
    console.log(`   Zone tariffs: ${tariffCount}`)
    console.log(`   Carriers: ${carrierCount}`)

    if (generatedCount === 0 && tariffCount === 0) {
      console.log('\n🚨 CRITICAL: Both generated_rates AND zone_tariffs are empty!')
      console.log('   This means either:')
      console.log('   1. No initial tariff data was loaded')
      console.log('   2. Rate generation was never executed')
      console.log('   3. Data was accidentally deleted')
    }

    // Check for any records at all
    if (tariffCount > 0) {
      const sampleTariffs = await prisma.zone_tariffs.findMany({
        take: 5,
        select: { zone_id: true, zone_name: true, weight_kg: true, tariff_amount: true }
      })
      console.log('\n✅ Sample tariff data found:')
      sampleTariffs.forEach(t => {
        console.log(`   Zone ${t.zone_id} (${t.zone_name}): ${t.weight_kg}kg = $${t.tariff_amount}`)
      })
    }

    if (generatedCount > 0) {
      const sampleRates = await prisma.generated_rates.findMany({
        take: 5,
        select: { zone_id: true, zone_name: true, weight_min: true, weight_max: true, calculated_price: true }
      })
      console.log('\n✅ Sample generated rates found:')
      sampleRates.forEach(r => {
        console.log(`   Zone ${r.zone_id} (${r.zone_name}): ${r.weight_min}-${r.weight_max}kg = $${r.calculated_price}`)
      })
    }

    console.log('\n📝 Investigation needed:')
    console.log('   1. Check if tariff CSV data was properly imported')
    console.log('   2. Check if rate generation script was run')
    console.log('   3. Verify database connectivity and schema')

  } catch (error) {
    console.error('❌ Data check failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDataExistence()
