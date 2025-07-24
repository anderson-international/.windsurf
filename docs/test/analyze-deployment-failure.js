/**
 * Analysis script for deployment failure - zones 0-4 missing rates
 * 
 * This script investigates why zones 0-4 received no rates during deployment
 * while Zone 6 (US) received proper rates.
 */

const { PrismaClient } = require('@prisma/client')

async function analyzeDeploymentFailure() {
  const prisma = new PrismaClient()
  console.log('🔍 Analyzing deployment failure for zones 0-4...\n')

  try {
    // 1. Check what rates exist in our database
    console.log('📊 Step 1: Checking generated rates in database')
    const generatedRates = await prisma.generated_rates.findMany({
      orderBy: [{ zone_id: 'asc' }, { weight_min: 'asc' }],
      select: {
        zone_id: true,
        zone_name: true,
        weight_min: true,
        weight_max: true,
        calculated_price: true
      }
    })

    // Group by zone
    const ratesByZone = {}
    generatedRates.forEach(rate => {
      if (!ratesByZone[rate.zone_id]) {
        ratesByZone[rate.zone_id] = []
      }
      ratesByZone[rate.zone_id].push(rate)
    })

    // Show summary by zone
    for (let zoneId = 0; zoneId <= 7; zoneId++) {
      const rates = ratesByZone[zoneId] || []
      const zoneName = rates.length > 0 ? rates[0].zone_name : 'Unknown'
      console.log(`   Zone ${zoneId} (${zoneName}): ${rates.length} rates`)
      
      if (rates.length === 0) {
        console.log('     ❌ NO RATES - This explains deployment failure!')
      } else if (rates.length < 50) {
        console.log('     ⚠️  LOW RATE COUNT - Possible gaps')
      } else {
        console.log('     ✅ Good rate coverage')
      }
    }

    // 2. Check zone tariffs (source data)
    console.log('\n📊 Step 2: Checking zone tariffs (source data)')
    const zoneTariffs = await prisma.zone_tariffs.findMany({
      orderBy: [{ zone_id: 'asc' }, { weight_kg: 'asc' }],
      select: {
        zone_id: true,
        weight_kg: true,
        tariff_amount: true
      }
    })

    const tariffsByZone = {}
    zoneTariffs.forEach(tariff => {
      if (!tariffsByZone[tariff.zone_id]) {
        tariffsByZone[tariff.zone_id] = []
      }
      tariffsByZone[tariff.zone_id].push(tariff)
    })

    for (let zoneId = 0; zoneId <= 7; zoneId++) {
      const tariffs = tariffsByZone[zoneId] || []
      console.log(`   Zone ${zoneId}: ${tariffs.length} tariffs`)
      
      if (tariffs.length === 0) {
        console.log('     ❌ NO TARIFFS - Cannot generate rates without source data!')
      } else {
        const maxWeight = Math.max(...tariffs.map(t => t.weight_kg))
        console.log(`     ✅ Tariffs available (max weight: ${maxWeight}kg)`)
      }
    }

    // 3. Compare database vs deployment
    console.log('\n📊 Step 3: Database vs Deployment Comparison')
    console.log('   Database Status:')
    for (let zoneId = 0; zoneId <= 7; zoneId++) {
      const rates = ratesByZone[zoneId] || []
      const tariffs = tariffsByZone[zoneId] || []
      console.log(`     Zone ${zoneId}: ${rates.length} rates from ${tariffs.length} tariffs`)
    }

    console.log('\n   Deployment Status (from screenshot):')
    console.log('     Zone 0 (Germany): ❌ No rates deployed')
    console.log('     Zone 1 (Austria/Belgium/France): ❌ No rates deployed')
    console.log('     Zone 2 (Bulgaria/Croatia/Czechia): ❌ No rates deployed')
    console.log('     Zone 3 (Italy/Sweden): ❌ No rates deployed')
    console.log('     Zone 4 (Norway/Switzerland): ❌ No rates deployed')
    console.log('     Zone 6 (United States): ✅ Rates deployed successfully')

    // 4. Identify the deployment gap
    console.log('\n🔍 Step 4: Identifying deployment disconnect')
    
    const problemZones = [0, 1, 2, 3, 4]
    let hasDataButNotDeployed = []
    let hasNoDataAndNotDeployed = []

    problemZones.forEach(zoneId => {
      const rates = ratesByZone[zoneId] || []
      const tariffs = tariffsByZone[zoneId] || []
      
      if (rates.length > 0 && tariffs.length > 0) {
        hasDataButNotDeployed.push(zoneId)
      } else {
        hasNoDataAndNotDeployed.push(zoneId)
      }
    })

    if (hasDataButNotDeployed.length > 0) {
      console.log(`   🚨 DEPLOYMENT BUG: Zones ${hasDataButNotDeployed.join(', ')} have data but weren't deployed`)
      console.log('      → This indicates a deployment process failure')
    }

    if (hasNoDataAndNotDeployed.length > 0) {
      console.log(`   🚨 DATA GENERATION BUG: Zones ${hasNoDataAndNotDeployed.join(', ')} have no data to deploy`)
      console.log('      → This indicates a rate generation failure')
    }

    // 5. Recommendations
    console.log('\n💡 Next Steps:')
    if (hasDataButNotDeployed.length > 0) {
      console.log('   1. Investigate deployment process for selective zone failures')
      console.log('   2. Check deployment logs for zone-specific errors')
      console.log('   3. Verify zone mapping between database and Shopify')
    }
    
    if (hasNoDataAndNotDeployed.length > 0) {
      console.log('   1. Investigate rate generation process for missing zones')
      console.log('   2. Check if tariff data exists for these zones')
      console.log('   3. Verify zone configuration and generation logic')
    }

    console.log('\n✅ Deployment failure analysis complete!')

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  analyzeDeploymentFailure()
}

module.exports = { analyzeDeploymentFailure }
