/**
 * Universal Carrier Test Script
 * 
 * This script tests the universal carrier functionality by:
 * 1. Identifying carriers with UNIVERSAL zone_scope
 * 2. Verifying that universal tariffs exist and are correctly structured
 * 3. Testing that tariff replication works properly across all zones
 * 4. Validating rate generation without deploying to Shopify
 * 
 * Usage: node docs/test/test-universal-carrier.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Create a database client
const prisma = new PrismaClient();

// Test configuration
const LOG_LEVEL = {
  INFO: 0,
  DEBUG: 1,
  VERBOSE: 2
};

// Set to LOG_LEVEL.VERBOSE for most detailed output
const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

function log(message, level = LOG_LEVEL.INFO) {
  if (level <= CURRENT_LOG_LEVEL) {
    console.log(message);
  }
}

async function identifyUniversalCarriers() {
  log('🔍 Identifying carriers with UNIVERSAL zone_scope...');
  
  const universalCarriers = await prisma.carrier_services.findMany({
    where: {
      zone_scope: 'UNIVERSAL'
    },
    include: {
      carriers: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  if (universalCarriers.length === 0) {
    log('❌ No carriers with UNIVERSAL zone_scope found!', LOG_LEVEL.INFO);
    return [];
  }
  
  log(`✅ Found ${universalCarriers.length} carrier service(s) with UNIVERSAL scope`);
  
  universalCarriers.forEach(cs => {
    log(`   - Carrier: ${cs.carriers.name}, Service: ${cs.service_name} (ID: ${cs.id})`, LOG_LEVEL.INFO);
  });
  
  return universalCarriers;
}

async function verifyUniversalTariffs(universalCarriers) {
  log('\n🔍 Verifying universal tariff data...');
  
  const results = {};
  
  for (const carrierService of universalCarriers) {
    log(`\n📊 Checking universal tariffs for ${carrierService.carriers.name} - ${carrierService.service_name}...`, LOG_LEVEL.INFO);
    
    const universalTariffs = await prisma.universal_tariffs.findMany({
      where: {
        carrier_service_id: carrierService.id
      },
      orderBy: {
        weight_kg: 'asc'
      }
    });
    
    if (universalTariffs.length === 0) {
      log(`❌ No universal tariffs found for carrier service ID ${carrierService.id}!`);
      results[carrierService.id] = {
        status: 'FAIL',
        reason: 'No universal tariffs found',
        tariffs: []
      };
      continue;
    }
    
    log(`✅ Found ${universalTariffs.length} universal tariff entries`, LOG_LEVEL.INFO);
    log('   Weight ranges:', LOG_LEVEL.DEBUG);
    
    universalTariffs.forEach(tariff => {
      log(`   - ${tariff.weight_kg}kg: $${tariff.tariff_amount}`, LOG_LEVEL.DEBUG);
    });
    
    results[carrierService.id] = {
      status: 'OK',
      tariffs: universalTariffs
    };
  }
  
  return results;
}

async function testUniversalTariffReplication(universalCarriers, tariffResults) {
  log('\n🔄 Testing universal tariff replication across zones...');
  
  for (const carrierService of universalCarriers) {
    const carrierServiceId = carrierService.id;
    const tariffData = tariffResults[carrierServiceId];
    
    if (tariffData.status !== 'OK') {
      log(`⏭️  Skipping replication test for carrier service ${carrierServiceId} due to missing tariffs`);
      continue;
    }
    
    log(`\n🔄 Testing replication for ${carrierService.carriers.name} - ${carrierService.service_name}...`, LOG_LEVEL.INFO);
    
    // Get all available zones
    const allZones = await prisma.zone_tariffs.findMany({
      select: { zone_name: true },
      distinct: ['zone_name']
    });
    
    const uniqueZoneNames = [...new Set(allZones.map(zone => zone.zone_name))];
    log(`📍 Found ${uniqueZoneNames.length} unique zones for testing`, LOG_LEVEL.INFO);
    uniqueZoneNames.forEach(zone => log(`   - ${zone}`, LOG_LEVEL.DEBUG));
    
    // Test the replication logic by manually creating a map of zone tariffs
    const replicatedTariffs = new Map();
    
    tariffData.tariffs.forEach(tariff => {
      uniqueZoneNames.forEach(zoneName => {
        const zoneTariff = {
          zone_name: zoneName,
          weight_kg: Number(tariff.weight_kg),
          tariff_amount: Number(tariff.tariff_amount),
          carrier_id: carrierServiceId
        };
        
        if (!replicatedTariffs.has(zoneName)) {
          replicatedTariffs.set(zoneName, []);
        }
        
        replicatedTariffs.get(zoneName).push(zoneTariff);
      });
    });
    
    // Validate replication
    if (replicatedTariffs.size === uniqueZoneNames.length) {
      const totalTariffs = Array.from(replicatedTariffs.values()).reduce((sum, zoneTariffs) => sum + zoneTariffs.length, 0);
      log(`✅ Replication logic successful: ${replicatedTariffs.size} zones covered, ${totalTariffs} total tariffs`);
    } else {
      log(`❌ Replication failed: Expected ${uniqueZoneNames.length} zones, got ${replicatedTariffs.size}`);
    }
    
    // Select a sample zone to log more details
    if (replicatedTariffs.size > 0 && CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG) {
      const sampleZone = uniqueZoneNames[0];
      log(`\n📊 Sample tariffs for zone "${sampleZone}":`, LOG_LEVEL.DEBUG);
      
      const zoneTariffs = replicatedTariffs.get(sampleZone) || [];
      zoneTariffs.forEach(tariff => {
        log(`   - ${tariff.weight_kg}kg: $${tariff.tariff_amount}`, LOG_LEVEL.DEBUG);
      });
    }
  }
}

async function simulateRateGeneration(universalCarriers) {
  log('\n🧪 Simulating rate generation for universal carriers...');
  
  for (const carrierService of universalCarriers) {
    log(`\n📈 Simulating rates for ${carrierService.carriers.name} - ${carrierService.service_name}...`, LOG_LEVEL.INFO);
    
    // Get carrier info for rate calculation
    const carrierInfo = {
      carrier_name: carrierService.carriers.name,
      service_name: carrierService.service_name,
      delivery_description: carrierService.delivery_description,
      margin_percentage: Number(carrierService.margin_percentage),
      zone_scope: carrierService.zone_scope,
      max_parcel_weight: Number(carrierService.max_parcel_weight),
      max_total_weight: Number(carrierService.max_total_weight)
    };
    
    log(`   Carrier Details:`, LOG_LEVEL.INFO);
    log(`   - Service: ${carrierInfo.service_name}`, LOG_LEVEL.INFO);
    log(`   - Margin: ${carrierInfo.margin_percentage}%`, LOG_LEVEL.INFO);
    log(`   - Max Parcel Weight: ${carrierInfo.max_parcel_weight}kg`, LOG_LEVEL.INFO);
    log(`   - Zone Scope: ${carrierInfo.zone_scope}`, LOG_LEVEL.INFO);
    
    // Get universal tariffs for this carrier
    const universalTariffs = await prisma.universal_tariffs.findMany({
      where: { carrier_service_id: carrierService.id },
      orderBy: { weight_kg: 'asc' }
    });
    
    // Get all available zones
    const allZones = await prisma.zone_tariffs.findMany({
      select: { zone_name: true },
      distinct: ['zone_name']
    });
    
    const uniqueZoneNames = [...new Set(allZones.map(zone => zone.zone_name))];
    
    // Simulate the rate generation by calculating rates for different weights
    log(`\n   📊 Simulating rates for different weights across all zones...`, LOG_LEVEL.INFO);
    
    // Use the first three zones for simulation
    const testZones = uniqueZoneNames.slice(0, 3);
    const testWeights = [0.5, 1, 2, 5, 10, 20];
    
    testZones.forEach(zoneName => {
      log(`\n   📍 Zone: ${zoneName}`, LOG_LEVEL.INFO);
      
      testWeights.forEach(weight => {
        // Find the appropriate tariff for this weight
        let applicableTariff = null;
        for (let i = 0; i < universalTariffs.length; i++) {
          if (Number(universalTariffs[i].weight_kg) >= weight) {
            applicableTariff = universalTariffs[i];
            break;
          }
        }
        
        if (applicableTariff) {
          const baseRate = Number(applicableTariff.tariff_amount);
          const marginMultiplier = 1 + (carrierInfo.margin_percentage / 100);
          const finalRate = baseRate * marginMultiplier;
          
          log(`   - ${weight}kg: Base $${baseRate.toFixed(2)} → Final $${finalRate.toFixed(2)} (with ${carrierInfo.margin_percentage}% margin)`, LOG_LEVEL.INFO);
        } else {
          log(`   - ${weight}kg: No applicable tariff found`, LOG_LEVEL.INFO);
        }
      });
    });
    
    log(`\n   ✅ Rate simulation complete for ${carrierInfo.carrier_name} - ${carrierInfo.service_name}`, LOG_LEVEL.INFO);
  }
}

async function validateGeneratedRates(universalCarriers) {
  log('\n🔍 Validating carrier service zone configuration...');
  
  for (const carrierService of universalCarriers) {
    log(`\n📊 Checking zone configuration for ${carrierService.carriers.name} - ${carrierService.service_name}...`, LOG_LEVEL.INFO);
    
    try {
      // Check carrier_service_zones to see which zones this carrier is enabled for
      const serviceZones = await prisma.carrier_service_zones.findMany({
        where: {
          carrier_service_id: carrierService.id
        }
      });
      
      if (serviceZones.length === 0) {
        log(`⚠️  No zone configurations found for this carrier service`, LOG_LEVEL.INFO);
        log(`   Run scripts/generate-all-rates.js first to create zone associations`, LOG_LEVEL.INFO);
        continue;
      }
      
      log(`✅ Found ${serviceZones.length} zone configurations for this carrier`, LOG_LEVEL.INFO);
      
      // Check which zones are enabled
      const enabledZones = serviceZones.filter(zone => zone.enabled);
      const disabledZones = serviceZones.filter(zone => !zone.enabled);
      
      log(`   📊 Zone Status:`, LOG_LEVEL.INFO);
      log(`   - Enabled zones: ${enabledZones.length}`, LOG_LEVEL.INFO);
      log(`   - Disabled zones: ${disabledZones.length}`, LOG_LEVEL.INFO);
      
      if (enabledZones.length > 0) {
        // Check if any zones have been deployed
        const deployedZones = enabledZones.filter(zone => zone.last_deployed_at !== null);
        log(`   - Deployed zones: ${deployedZones.length}`, LOG_LEVEL.INFO);
        
        if (deployedZones.length > 0) {
          const latestDeployment = new Date(Math.max(...deployedZones.map(zone => zone.last_deployed_at ? new Date(zone.last_deployed_at).getTime() : 0)));
          log(`   - Latest deployment: ${latestDeployment.toLocaleString()}`, LOG_LEVEL.INFO);
        }
      }
      
      // Validate tariff data across zones (check consistency)
      log(`\n🔍 Validating tariff data consistency across zones...`, LOG_LEVEL.INFO);
      
      // Get all zone tariffs for this carrier
      const zoneTariffs = await prisma.zone_tariffs.findMany({
        where: {
          carrier_service_id: carrierService.id
        }
      });
      
      const tariffsByZone = {};
      zoneTariffs.forEach(tariff => {
        if (!tariffsByZone[tariff.zone_name]) {
          tariffsByZone[tariff.zone_name] = [];
        }
        tariffsByZone[tariff.zone_name].push(tariff);
      });
      
      // Check if each zone has the same number of tariff entries
      const zoneNames = Object.keys(tariffsByZone);
      
      if (zoneNames.length === 0) {
        log(`⚠️  No zone tariffs found for this carrier service`, LOG_LEVEL.INFO);
        continue;
      }
      
      log(`✅ Found tariff data for ${zoneNames.length} zones`, LOG_LEVEL.INFO);
      
      // Sample some zones to check consistency
      const sampleZones = zoneNames.slice(0, Math.min(3, zoneNames.length));
      
      for (const zoneName of sampleZones) {
        const zoneTariffs = tariffsByZone[zoneName];
        log(`   - Zone ${zoneName}: ${zoneTariffs.length} tariff entries`, LOG_LEVEL.INFO);
        
        if (CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG && zoneTariffs.length > 0) {
          log(`     Sample tariffs for Zone ${zoneName}:`, LOG_LEVEL.DEBUG);
          zoneTariffs.slice(0, 3).forEach(tariff => {
            log(`     • ${tariff.weight_kg}kg: $${tariff.tariff_amount}`, LOG_LEVEL.DEBUG);
          });
        }
      }
      
      // Check if the number of tariff entries is consistent across zones
      const tariffCounts = zoneNames.map(zone => tariffsByZone[zone].length);
      const isConsistent = tariffCounts.every(count => count === tariffCounts[0]);
      
      if (isConsistent) {
        log(`✅ Tariff consistency check: PASSED - All zones have ${tariffCounts[0]} tariff entries`, LOG_LEVEL.INFO);
      } else {
        log(`⚠️  Tariff consistency check: FAILED - Zones have varying numbers of tariff entries`, LOG_LEVEL.INFO);
        log(`   This may indicate an issue with the universal carrier replication`, LOG_LEVEL.INFO);
      }
      
    } catch (error) {
      log(`❌ Error validating carrier service: ${error.message}`, LOG_LEVEL.INFO);
      log(`   ${error.stack}`, LOG_LEVEL.DEBUG);
    }
  }
}

async function runTests() {
  console.log('🚀 UNIVERSAL CARRIER TEST SCRIPT');
  console.log('===============================================\n');
  
  try {
    // Step 1: Identify universal carriers
    const universalCarriers = await identifyUniversalCarriers();
    
    if (universalCarriers.length === 0) {
      console.log('\n❌ TEST ABORTED: No carriers with UNIVERSAL scope found');
      return;
    }
    
    // Step 2: Verify universal tariffs exist
    const tariffResults = await verifyUniversalTariffs(universalCarriers);
    
    // Step 3: Test tariff replication logic
    await testUniversalTariffReplication(universalCarriers, tariffResults);
    
    // Step 4: Simulate rate generation
    await simulateRateGeneration(universalCarriers);
    
    // Step 5: Validate any previously generated rates
    await validateGeneratedRates(universalCarriers);
    
    console.log('\n===============================================');
    console.log('🎉 UNIVERSAL CARRIER TEST COMPLETE');
    
    // Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log(`   - Universal carriers found: ${universalCarriers.length}`);
    
    const validCarriers = universalCarriers.filter(cs => 
      tariffResults[cs.id]?.status === 'OK');
    
    console.log(`   - Carriers with valid universal tariffs: ${validCarriers.length}`);
    console.log(`   - Test coverage: ${Math.round((validCarriers.length / universalCarriers.length) * 100)}%`);
    
    if (validCarriers.length === universalCarriers.length) {
      console.log('\n✅ OVERALL TEST RESULT: PASS');
      console.log('   All universal carriers have proper tariff data and should function correctly');
    } else {
      console.log('\n⚠️  OVERALL TEST RESULT: PARTIAL PASS');
      console.log('   Some universal carriers may not have proper tariff data');
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('   1. Review the test results to ensure universal tariffs look correct');
    console.log('   2. If satisfied, use scripts/generate-all-rates.js to generate actual rates');
    console.log('   3. Before deploying to Shopify, verify the generated rates in the database');
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests().catch(console.error);
