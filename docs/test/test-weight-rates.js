/**
 * Test script to demonstrate weight-based rate generation
 * Generates rates for a range of weights up to the max carrier weight
 * Demonstrates how multi-parcel shipments are handled
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

// Configure logging
const LOG_FILE = path.join(__dirname, 'weight-rates-test-output.log')
const LOG_LEVEL = {
  DEBUG: 3,
  INFO: 2,
  WARNING: 1,
  ERROR: 0
}
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG

// Clear previous log file if exists
fs.writeFileSync(LOG_FILE, '🚀 WEIGHT-BASED RATES TEST LOG\n===============================================\n\n', 'utf8')

function log(message, level = LOG_LEVEL.INFO) {
  if (level <= CURRENT_LOG_LEVEL) {
    console.log(message)
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8')
  }
}

/**
 * Calculate rate based on tariffs and weight
 * This replicates the production rate calculation algorithm
 */
function calculateRateForWeight(tariffs, weight, maxParcelWeight, marginPercentage) {
  // If weight exceeds max total weight, no rate applies
  if (weight <= 0) {
    return { error: 'Weight must be greater than 0' }
  }
  
  // Calculate how many parcels needed
  const numberOfParcels = Math.ceil(weight / maxParcelWeight)
  const results = {
    weight,
    numberOfParcels,
    parcelBreakdown: []
  }
  
  let totalRate = 0
  let remainingWeight = weight
  
  // Calculate rate for each parcel
  for (let i = 0; i < numberOfParcels; i++) {
    const parcelWeight = Math.min(remainingWeight, maxParcelWeight)
    remainingWeight -= parcelWeight
    
    // Find applicable tariff for this parcel weight
    let applicableTariff = null
    for (const tariff of tariffs) {
      if (Number(tariff.weight_kg) >= parcelWeight) {
        applicableTariff = tariff
        break
      }
    }
    
    if (!applicableTariff) {
      return { 
        error: `No applicable tariff found for parcel weight ${parcelWeight}kg` 
      }
    }
    
    const baseRate = Number(applicableTariff.tariff_amount)
    results.parcelBreakdown.push({
      parcelNumber: i + 1,
      weight: parcelWeight,
      tariffThreshold: Number(applicableTariff.weight_kg),
      baseRate
    })
    
    totalRate += baseRate
  }
  
  // Apply margin
  const finalRate = totalRate * (1 + (marginPercentage / 100))
  results.baseRate = Number(totalRate.toFixed(2))
  results.finalRate = Number(finalRate.toFixed(2))
  results.marginApplied = marginPercentage
  
  return results
}

/**
 * Main test function
 */
async function testWeightRates() {
  try {
    log('🔍 Finding universal carriers...')
    
    // Get a universal carrier service
    const universalCarrier = await prisma.carrier_services.findFirst({
      where: { zone_scope: 'UNIVERSAL' },
      include: { carriers: true }
    })
    
    if (!universalCarrier) {
      log('❌ No universal carriers found', LOG_LEVEL.ERROR)
      return
    }
    
    log(`✅ Found universal carrier: ${universalCarrier.carriers.name} - ${universalCarrier.service_name}`)
    
    // Get carrier details
    const carrierInfo = {
      carrier_name: universalCarrier.carriers.name,
      service_name: universalCarrier.service_name,
      margin_percentage: Number(universalCarrier.margin_percentage),
      max_parcel_weight: Number(universalCarrier.max_parcel_weight),
      max_total_weight: Number(universalCarrier.max_total_weight)
    }
    
    log('\n📊 Carrier Details:')
    log(`- Service: ${carrierInfo.service_name}`)
    log(`- Margin: ${carrierInfo.margin_percentage}%`)
    log(`- Max Parcel Weight: ${carrierInfo.max_parcel_weight}kg`)
    log(`- Max Total Weight: ${carrierInfo.max_total_weight}kg`)
    log(`- Max Parcels: ${Math.ceil(carrierInfo.max_total_weight / carrierInfo.max_parcel_weight)}`)
    
    // Get universal tariffs
    const universalTariffs = await prisma.universal_tariffs.findMany({
      where: { carrier_service_id: universalCarrier.id },
      orderBy: { weight_kg: 'asc' }
    })
    
    if (universalTariffs.length === 0) {
      log('❌ No universal tariffs found', LOG_LEVEL.ERROR)
      return
    }
    
    log(`\n📊 Available Tariff Weight Breaks:`)
    universalTariffs.forEach(tariff => {
      log(`- ${tariff.weight_kg}kg: $${tariff.tariff_amount}`)
    })
    
    // Generate test weight range up to max total weight
    log('\n🧪 Testing weight range from 0.1kg to max total weight...')
    
    // Create weight ranges for testing
    // 1. Fine-grained weights near tariff breaks
    // 2. Each whole kg weight
    // 3. Special cases like max parcel weight, max total weight
    
    let testWeights = []
    
    // Add weights around tariff breaks
    universalTariffs.forEach(tariff => {
      const weight = Number(tariff.weight_kg)
      // Just below
      if (weight > 0.1) testWeights.push(weight - 0.1)
      // Exact
      testWeights.push(weight)
      // Just above
      testWeights.push(weight + 0.1)
    })
    
    // Add whole kg weights
    for (let i = 1; i <= Math.ceil(carrierInfo.max_total_weight); i++) {
      testWeights.push(i)
    }
    
    // Add max weights
    testWeights.push(carrierInfo.max_parcel_weight)
    testWeights.push(carrierInfo.max_total_weight)
    
    // Add multi-parcel edge cases
    testWeights.push(carrierInfo.max_parcel_weight + 0.1)
    testWeights.push(carrierInfo.max_parcel_weight * 2)
    
    // Remove duplicates and sort
    testWeights = [...new Set(testWeights)].sort((a, b) => a - b)
    
    log(`\n📈 Calculating rates for ${testWeights.length} different weights...`)
    log('\n╔════════════╦═══════════════╦══════════════╦═══════════╦═════════════╦════════════════╗')
    log('║ Weight(kg) ║ # of Parcels   ║ Base Rate($) ║ Margin(%) ║ Final Rate($)║ Parcel Breakdown║')
    log('╠════════════╬═══════════════╬══════════════╬═══════════╬═════════════╬════════════════╣')
    
    // Calculate rates for each weight
    for (const weight of testWeights) {
      const result = calculateRateForWeight(
        universalTariffs,
        weight,
        carrierInfo.max_parcel_weight,
        carrierInfo.margin_percentage
      )
      
      if (result.error) {
        log(`║ ${weight.toFixed(1).padEnd(10)} ║ ERROR: ${result.error.padEnd(65)} ║`)
      } else {
        const breakdownText = result.parcelBreakdown.map(p => 
          `P${p.parcelNumber}:${p.weight.toFixed(1)}kg→$${p.baseRate}`
        ).join(', ')
        
        log(`║ ${weight.toFixed(1).padEnd(10)} ║ ${String(result.numberOfParcels).padEnd(15)} ║ $${String(result.baseRate).padEnd(11)} ║ ${String(result.marginApplied).padEnd(9)} ║ $${String(result.finalRate).padEnd(10)} ║ ${breakdownText.padEnd(14)} ║`)
      }
    }
    
    log('╚════════════╩═══════════════╩══════════════╩═══════════╩═════════════╩════════════════╝')
    
    // Special section on multi-parcel logic
    log('\n🔍 MULTI-PARCEL RATE CALCULATION EXPLAINED:')
    log('1. For weights exceeding max parcel weight, shipment is split into multiple parcels')
    log('2. Each parcel is charged based on its weight using the "next weight break" tariff')
    log('3. Rates for all parcels are summed to get the total base rate')
    log('4. Margin percentage is applied to the total base rate')
    
    // Show detailed examples
    log('\n📝 DETAILED EXAMPLES:')
    
    // Example 1: Single parcel
    const example1Weight = Math.min(carrierInfo.max_parcel_weight / 2, 1)
    const example1 = calculateRateForWeight(
      universalTariffs,
      example1Weight,
      carrierInfo.max_parcel_weight,
      carrierInfo.margin_percentage
    )
    
    if (!example1.error) {
      log(`\nExample 1: Single parcel (${example1Weight}kg)`)
      log(`- Total weight: ${example1Weight}kg (within max parcel weight of ${carrierInfo.max_parcel_weight}kg)`)
      log(`- Number of parcels: ${example1.numberOfParcels}`)
      log(`- Parcel breakdown:`)
      example1.parcelBreakdown.forEach(p => {
        log(`  • Parcel ${p.parcelNumber}: ${p.weight}kg (uses ${p.tariffThreshold}kg tariff at $${p.baseRate})`)
      })
      log(`- Base rate: $${example1.baseRate}`)
      log(`- Margin applied: ${example1.marginApplied}%`)
      log(`- Final rate: $${example1.finalRate}`)
    }
    
    // Example 2: Multi-parcel
    const example2Weight = carrierInfo.max_parcel_weight + (carrierInfo.max_parcel_weight / 2)
    const example2 = calculateRateForWeight(
      universalTariffs,
      example2Weight,
      carrierInfo.max_parcel_weight,
      carrierInfo.margin_percentage
    )
    
    if (!example2.error) {
      log(`\nExample 2: Multi-parcel (${example2Weight}kg)`)
      log(`- Total weight: ${example2Weight}kg (exceeds max parcel weight of ${carrierInfo.max_parcel_weight}kg)`)
      log(`- Number of parcels: ${example2.numberOfParcels}`)
      log(`- Parcel breakdown:`)
      example2.parcelBreakdown.forEach(p => {
        log(`  • Parcel ${p.parcelNumber}: ${p.weight}kg (uses ${p.tariffThreshold}kg tariff at $${p.baseRate})`)
      })
      log(`- Base rate: $${example2.baseRate} (sum of all parcel rates)`)
      log(`- Margin applied: ${example2.marginApplied}%`)
      log(`- Final rate: $${example2.finalRate}`)
    }
    
    // Example 3: Max weight
    const example3 = calculateRateForWeight(
      universalTariffs,
      carrierInfo.max_total_weight,
      carrierInfo.max_parcel_weight,
      carrierInfo.margin_percentage
    )
    
    if (!example3.error) {
      log(`\nExample 3: Maximum weight (${carrierInfo.max_total_weight}kg)`)
      log(`- Total weight: ${carrierInfo.max_total_weight}kg (max total weight)`)
      log(`- Number of parcels: ${example3.numberOfParcels}`)
      log(`- Parcel breakdown:`)
      example3.parcelBreakdown.forEach(p => {
        log(`  • Parcel ${p.parcelNumber}: ${p.weight}kg (uses ${p.tariffThreshold}kg tariff at $${p.baseRate})`)
      })
      log(`- Base rate: $${example3.baseRate} (sum of all parcel rates)`)
      log(`- Margin applied: ${example3.marginApplied}%`)
      log(`- Final rate: $${example3.finalRate}`)
    }
    
    log('\n===============================================')
    log(`✅ Test complete! Full results written to ${LOG_FILE}`)

  } catch (error) {
    log(`❌ Error: ${error.message}`, LOG_LEVEL.ERROR)
    log(error.stack, LOG_LEVEL.DEBUG)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testWeightRates()
