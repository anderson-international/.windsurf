require('dotenv').config()

async function testRemainderCalculation() {
  console.log('🧪 Remainder Weight Calculation Test')
  console.log('===================================\n')

  const MAX_PARCEL_WEIGHT = 2.00

  // Test cases for parcel 2
  const testCases = [
    { parcel: 2, rangeMin: 2.00, rangeMax: 2.05 },
    { parcel: 2, rangeMin: 2.05, rangeMax: 2.10 },
    { parcel: 2, rangeMin: 2.10, rangeMax: 2.15 },
    { parcel: 2, rangeMin: 2.15, rangeMax: 2.20 },
    { parcel: 2, rangeMin: 2.20, rangeMax: 2.25 }
  ]

  console.log('🔍 Current (Buggy) Logic vs Corrected Logic:')
  console.log('============================================\n')

  testCases.forEach((test, i) => {
    const currentLookupWeight = test.rangeMax  // What current code does
    const remainderWeight = test.rangeMax - (test.parcel - 1) * MAX_PARCEL_WEIGHT  // What it should do
    
    console.log(`Test ${i+1}: Parcel ${test.parcel}, Range ${test.rangeMin}kg → ${test.rangeMax}kg`)
    console.log(`   Current logic: Looks up tariff for ${currentLookupWeight}kg`)
    console.log(`   Correct logic: Should look up tariff for ${remainderWeight}kg`)
    console.log(`   Calculation: ${test.rangeMax} - (${test.parcel - 1} × ${MAX_PARCEL_WEIGHT}) = ${remainderWeight}`)
    console.log()
  })

  // Now test with actual tariff data
  console.log('📊 Testing with Actual Zone 0 Tariffs:')
  console.log('======================================\n')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const zone0Tariffs = await prisma.zone_tariffs.findMany({
      where: { zone_name: 'Zone 0' },
      orderBy: { weight_kg: 'asc' }
    })

    // Helper function to find tariff (simulate current lookup)
    function findTariffForWeight(tariffs, weight) {
      const tariff = tariffs.find(t => parseFloat(t.weight_kg) >= weight)
      return tariff ? parseFloat(tariff.tariff_amount) : parseFloat(tariffs[tariffs.length - 1].tariff_amount)
    }

    // Simulate previousParcelMaxRate (should be max tariff from parcel 1)
    const previousParcelMaxRate = Math.max(...zone0Tariffs.map(t => parseFloat(t.tariff_amount)))
    console.log(`Previous Parcel Max Rate: £${previousParcelMaxRate}`)
    console.log()

    testCases.forEach((test, i) => {
      const currentLookupWeight = test.rangeMax
      const remainderWeight = test.rangeMax - (test.parcel - 1) * MAX_PARCEL_WEIGHT

      const currentTariff = findTariffForWeight(zone0Tariffs, currentLookupWeight)
      const correctTariff = findTariffForWeight(zone0Tariffs, remainderWeight)

      const currentResult = Math.round((previousParcelMaxRate + currentTariff) * 100) / 100
      const correctResult = Math.round((previousParcelMaxRate + correctTariff) * 100) / 100

      console.log(`${test.rangeMin}kg → ${test.rangeMax}kg:`)
      console.log(`   Current: £${previousParcelMaxRate} + £${currentTariff} = £${currentResult}`)
      console.log(`   Correct: £${previousParcelMaxRate} + £${correctTariff} = £${correctResult}`)
      console.log(`   Difference: £${(correctResult - currentResult).toFixed(2)}`)
      console.log()
    })

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

if (require.main === module) {
  testRemainderCalculation()
}

module.exports = { testRemainderCalculation }
