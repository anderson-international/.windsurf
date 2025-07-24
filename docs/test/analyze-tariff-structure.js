require('dotenv').config()

async function analyzeTariffStructure() {
  console.log('🔍 Zone Tariff Structure Analysis')
  console.log('=================================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Get Zone 0 tariffs
    const zone0Tariffs = await prisma.zone_tariffs.findMany({
      where: {
        zone_name: 'Zone 0'
      },
      orderBy: {
        weight_kg: 'asc'
      }
    })

    console.log(`📊 Found ${zone0Tariffs.length} Zone 0 tariffs:\n`)

    // Show all tariffs
    zone0Tariffs.forEach((tariff, i) => {
      console.log(`   ${String(i+1).padStart(2)}. Weight: ${tariff.weight_kg}kg → Tariff: £${tariff.tariff_amount}`)
    })

    // Analyze the current lookup bug
    console.log('\n🐛 Current Lookup Bug Demonstration:')
    console.log('=====================================')

    const testWeights = [2.05, 2.1, 2.15, 2.2, 2.25, 2.3]
    
    console.log('Testing weights that should have different tariffs:\n')

    testWeights.forEach(weight => {
      // Simulate current buggy logic
      const buggyTariff = zone0Tariffs.find(t => parseFloat(t.weight_kg) >= weight)
      
      console.log(`   Weight ${weight}kg:`)
      console.log(`     Current logic (>= ${weight}): Finds tariff for ${buggyTariff?.weight_kg}kg = £${buggyTariff?.tariff_amount}`)
      
      // Show what correct logic should do
      const correctTariff = zone0Tariffs.find(t => parseFloat(t.weight_kg) === weight)
      if (correctTariff) {
        console.log(`     Correct logic (== ${weight}): Should find £${correctTariff.tariff_amount}`)
      } else {
        console.log(`     Correct logic: No exact match for ${weight}kg`)
      }
      console.log()
    })

    // Show how tariffs should progress
    console.log('📈 Expected Tariff Progression:')
    console.log('===============================')
    
    const parcel2Weights = zone0Tariffs.filter(t => 
      parseFloat(t.weight_kg) >= 2.0 && parseFloat(t.weight_kg) < 4.0
    )

    console.log('Parcel 2 tariffs (2kg-4kg range):')
    parcel2Weights.forEach((tariff, i) => {
      console.log(`   ${tariff.weight_kg}kg → £${tariff.tariff_amount}`)
    })

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  analyzeTariffStructure()
}

module.exports = { analyzeTariffStructure }
