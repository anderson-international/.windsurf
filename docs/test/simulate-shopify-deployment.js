/**
 * Shopify Deployment Simulation
 * 
 * This script simulates how universal carrier rates would appear in the Shopify admin
 * after deployment. It generates a report in a similar format to the Shopify UI.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Configure logging
const LOG_FILE = path.join(__dirname, 'shopify-deployment-simulation.log');
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// Standard weight breaks for rate display (in kg)
// These weight breaks match how Shopify displays rate tiers
const STANDARD_WEIGHT_BREAKS = [
  { min: 0, max: 0.05 },
  { min: 0.05, max: 0.1 },
  { min: 0.1, max: 0.15 },
  { min: 0.15, max: 0.2 },
  { min: 0.2, max: 0.25 },
  { min: 0.25, max: 0.3 },
  { min: 0.3, max: 0.35 },
  { min: 0.35, max: 0.4 },
  { min: 0.4, max: 0.45 },
  { min: 0.45, max: 0.5 },
  { min: 0.5, max: 0.6 },
  { min: 0.6, max: 0.7 },
  { min: 0.7, max: 0.8 },
  { min: 0.8, max: 0.9 },
  { min: 0.9, max: 1 },
  { min: 1, max: 1.25 },
  { min: 1.25, max: 1.5 },
  { min: 1.5, max: 1.75 },
  { min: 1.75, max: 2 },
  { min: 2, max: 2.5 },
  { min: 2.5, max: 3 },
  { min: 3, max: 3.5 },
  { min: 3.5, max: 4 },
  { min: 4, max: 4.5 },
  { min: 4.5, max: 5 },
  { min: 5, max: 6 },
  { min: 6, max: 7 },
  { min: 7, max: 8 },
];

// Clear previous log file
fs.writeFileSync(LOG_FILE, '', 'utf8');

// Logging function
function log(message) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
}

/**
 * Calculate rate based on tariffs and weight
 */
function calculateRateForWeight(tariffs, weight, maxParcelWeight, marginPercentage) {
  // If weight exceeds max total weight or is <= 0, no rate applies
  if (weight <= 0) {
    return null;
  }
  
  // Calculate how many parcels needed
  const numberOfParcels = Math.ceil(weight / maxParcelWeight);
  let totalRate = 0;
  let remainingWeight = weight;
  
  // Calculate rate for each parcel
  for (let i = 0; i < numberOfParcels; i++) {
    const parcelWeight = Math.min(remainingWeight, maxParcelWeight);
    remainingWeight -= parcelWeight;
    
    // Find applicable tariff for this parcel weight
    let applicableTariff = null;
    for (const tariff of tariffs) {
      if (Number(tariff.weight_kg) >= parcelWeight) {
        applicableTariff = tariff;
        break;
      }
    }
    
    if (!applicableTariff) {
      return null;
    }
    
    const baseRate = Number(applicableTariff.tariff_amount);
    totalRate += baseRate;
  }
  
  // Apply margin
  const finalRate = totalRate * (1 + (marginPercentage / 100));
  return Number(finalRate.toFixed(2));
}

/**
 * Generate rates for a specific zone for the provided carrier
 */
async function generateRatesForZone(carrier, zoneName, universalTariffs) {
  const rates = [];
  
  for (const weightBreak of STANDARD_WEIGHT_BREAKS) {
    // Calculate rate for the upper limit of the weight range
    const rate = calculateRateForWeight(
      universalTariffs,
      weightBreak.max,
      carrier.max_parcel_weight,
      carrier.margin_percentage
    );
    
    if (rate !== null) {
      rates.push({
        carrier_name: carrier.carriers.name,
        service_name: carrier.service_name,
        zone_name: zoneName,
        min_weight: weightBreak.min,
        max_weight: weightBreak.max,
        rate_amount: rate,
        display_name: `${carrier.service_name}`,
        delivery_description: carrier.delivery_description
      });
    }
  }
  
  return rates;
}

/**
 * Format rates in Shopify admin-like display
 */
function formatShopifyRatesDisplay(rates, zoneName) {
  let output = [];
  
  output.push(`🌐 ${zoneName}`);
  output.push(''.padEnd(80, '═'));
  
  // Group rates by carrier and service
  const ratesByCarrier = {};
  rates.forEach(rate => {
    const key = `${rate.carrier_name} ${rate.service_name}`;
    if (!ratesByCarrier[key]) {
      ratesByCarrier[key] = [];
    }
    ratesByCarrier[key].push(rate);
  });
  
  // Format each carrier's rates like Shopify admin
  Object.keys(ratesByCarrier).forEach(carrierKey => {
    const carrierRates = ratesByCarrier[carrierKey];
    
    // Get the first rate to extract carrier info
    const firstRate = carrierRates[0];
    output.push(`\n${firstRate.carrier_name} ${firstRate.service_name}`);
    output.push(`${firstRate.delivery_description}`);
    output.push(''.padEnd(80, '─'));
    
    // Format each rate tier
    carrierRates.forEach(rate => {
      const weightRange = `Orders ${rate.min_weight}kg-${rate.max_weight}kg`;
      const priceDisplay = `£${rate.rate_amount.toFixed(2)}`;
      
      // Format in columns similar to Shopify admin
      output.push(`${weightRange.padEnd(40)}${priceDisplay.padStart(10)}`);
    });
    
    output.push(''.padEnd(80, '─'));
  });
  
  return output.join('\n');
}

/**
 * Main function to simulate Shopify deployment
 */
async function simulateShopifyDeployment() {
  try {
    log('🔄 SHOPIFY DEPLOYMENT SIMULATION');
    log(`🗓️  ${CURRENT_DATE}`);
    log(''.padEnd(80, '='));
    log('');
    
    // Find universal carriers
    const universalCarriers = await prisma.carrier_services.findMany({
      where: { zone_scope: 'UNIVERSAL' },
      include: { carriers: true }
    });
    
    if (universalCarriers.length === 0) {
      log('❌ No universal carriers found');
      return;
    }
    
    log(`✅ Found ${universalCarriers.length} universal carrier(s)`);
    log('');
    
    // Get all zones from the database
    const zones = await prisma.zone_tariffs.findMany({
      select: { zone_name: true },
      distinct: ['zone_name']
    });
    
    const uniqueZones = [...new Set(zones.map(z => z.zone_name))].sort();
    log(`📍 Found ${uniqueZones.length} unique zones in the database`);
    log('');
    
    // Process each universal carrier
    for (const carrier of universalCarriers) {
      log(`🚚 Processing: ${carrier.carriers.name} - ${carrier.service_name}`);
      
      // Get universal tariffs for this carrier
      const universalTariffs = await prisma.universal_tariffs.findMany({
        where: { carrier_service_id: carrier.id },
        orderBy: { weight_kg: 'asc' }
      });
      
      if (universalTariffs.length === 0) {
        log(`❌ No universal tariffs found for ${carrier.carriers.name} - ${carrier.service_name}`);
        continue;
      }
      
      log(`✅ Found ${universalTariffs.length} tariff entries for this carrier`);
      log('');
      
      // Simulate rate generation for each zone
      for (const zoneName of uniqueZones) {
        const rates = await generateRatesForZone(carrier, zoneName, universalTariffs);
        
        if (rates.length === 0) {
          log(`❌ No rates generated for zone "${zoneName}"`);
          continue;
        }
        
        log(formatShopifyRatesDisplay(rates, zoneName));
        log('\n');
      }
      
      log(`✅ Rate simulation complete for ${carrier.carriers.name} - ${carrier.service_name}`);
      log(''.padEnd(80, '-'));
      log('');
    }
    
    log('🎉 DEPLOYMENT SIMULATION COMPLETE');
    log(`📄 Full results saved to: ${LOG_FILE}`);
    
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the simulation
simulateShopifyDeployment();
