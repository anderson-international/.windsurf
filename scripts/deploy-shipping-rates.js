/**
 * Deploy Shipping Rates to Shopify
 * 
 * Script to deploy generated shipping rates to Shopify.
 * Handles full end-to-end deployment process.
 * 
 * Usage: 
 *   node scripts/deploy-shipping-rates.js           # Live deployment
 *   node scripts/deploy-shipping-rates.js --dry-run # Preview only, no changes to Shopify
 */

// Uses only Node.js built-in modules - No external dependencies required
const http = require('http');
const fs = require('fs');
const path = require('path');

// Check for dry run mode
const DRY_RUN = process.argv.includes('--dry-run');
const LOG_FILE = DRY_RUN ? path.join(__dirname, '..', 'docs', 'test', 'shopify-deployment-preview.log') : null;

// Log function that writes to both console and file in dry run mode
function log(message, isDryRunOnly = false) {
  // Only show dry-run-only messages in dry run mode
  if (isDryRunOnly && !DRY_RUN) return;
  
  console.log(message);
  
  // Also log to file in dry run mode
  if (DRY_RUN && LOG_FILE) {
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
  }
}

// Simple HTTP request helper using built-in modules
function makeRequest(options, postData = null, previewData = null) {
  // In dry run mode, handle POST requests differently
  if (DRY_RUN && options.method === 'POST' && previewData) {
    log(`📋 [DRY RUN] Would send to ${options.path}:`, true);
    log(JSON.stringify(previewData, null, 2), true);
    
    // Return simulated success response
    return Promise.resolve({
      status: 200,
      data: {
        success: true,
        data: previewData.preview_response,
        is_dry_run: true
      }
    });
  }
  
  // Normal request logic for GET requests or when not in dry run mode
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

async function fetchRatePreview(zone) {
  // First, get the shipping rates from the main shipping-rates endpoint
  const ratesResponse = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/shipping-rates',
    method: 'GET'
  });
  
  if (ratesResponse.status !== 200) {
    return { error: `Failed to get rates: HTTP ${ratesResponse.status}` };
  }
  
  // Get all shipping rates and filter by zone
  const allRates = ratesResponse.data.data || [];
  
  // Filter rates for this specific zone
  // Note: The actual filter logic depends on your data structure. This is a placeholder.
  const zoneRates = allRates.filter(rate => {
    // Zone might be identified in different ways in your data structure
    // This is an educated guess - adjust based on your actual data structure
    return rate.zone_id === zone.id || 
           rate.zone_name === zone.name ||
           (rate.zone && rate.zone.id === zone.id);
  });
  
  if (zoneRates.length === 0) {
    log(`   📋 [DRY RUN] No rates found for zone: ${zone.name} (ID: ${zone.id})`, true);
    // Return empty result but don't treat as error
    return {
      rates: [],
      ratesByCarrier: {},
      count: 0,
      preview_response: {
        success: true,
        deployed_rates: 0
      }
    };
  }
  
  // Group by carrier service for better display
  const ratesByCarrier = {};
  zoneRates.forEach(rate => {
    const key = rate.carrier_service_id || 'unknown';
    if (!ratesByCarrier[key]) {
      ratesByCarrier[key] = [];
    }
    ratesByCarrier[key].push(rate);
  });
  
  return {
    rates: zoneRates,
    ratesByCarrier: ratesByCarrier,
    count: zoneRates.length,
    preview_response: {
      success: true,
      deployed_rates: zoneRates.length
    }
  };
}

async function deployShippingRates() {
  // Clear log file in dry run mode
  if (DRY_RUN && LOG_FILE) {
    fs.writeFileSync(LOG_FILE, '', 'utf8');
  }
  
  if (DRY_RUN) {
    log('🔍 SHOPIFY SHIPPING RATE DEPLOYMENT [DRY RUN MODE]');
    log('⚠️  NO CHANGES WILL BE MADE TO SHOPIFY ⚠️');
  } else {
    log('🚀 SHOPIFY SHIPPING RATE DEPLOYMENT');
  }
  log('============================================================\n');
  
  try {
    // Step 1: Get all zones
    log('📊 Step 1: Getting all Shopify zones...');
    const zonesResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/zones',
      method: 'GET'
    });

    if (zonesResponse.status !== 200 || !zonesResponse.data.success) {
      throw new Error(`Failed to get zones: ${zonesResponse.data?.error || 'Unknown error'}`);
    }

    const zones = zonesResponse.data.data;
    log(`✅ Found ${zones.length} zones\n`);

    // Step 2: Deploy rates for each zone
    let successCount = 0;
    let failureCount = 0;
    let totalRatesDeployed = 0;

    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      log(`🎯 Processing Zone ${i + 1}/${zones.length}: ${zone.name}`);

      try {
        // In dry run mode, get a preview of what would be deployed
        let previewData = null;
        
        if (DRY_RUN) {
          previewData = await fetchRatePreview(zone);
          
          if (previewData.error) {
            throw new Error(previewData.error);
          }
          
          // Display detailed preview
          log(`   📋 [DRY RUN] Preview for ${zone.name}:`, true);
          if (previewData.ratesByCarrier) {
            Object.entries(previewData.ratesByCarrier).forEach(([carrierId, rates]) => {
              log(`      • Carrier ID ${carrierId}: ${rates.length} rates`, true);
              // Sample some rates
              if (rates.length > 0) {
                log(`        Sample rates:`, true);
                rates.slice(0, 3).forEach(rate => {
                  log(`        - ${rate.name || 'Unnamed Rate'}: ${rate.price || 'N/A'}`, true);
                });
                if (rates.length > 3) {
                  log(`        ... and ${rates.length - 3} more rates`, true);
                }
              }
            });
          }
        }
        
        // Deploy rates to this zone (or simulate in dry run mode)
        const deployResponse = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: '/api/rates/deploy-zone',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, {
          zone_id: zone.id
        }, previewData);

        if (deployResponse.status === 200 && deployResponse.data?.data?.success) {
          const deployedRates = deployResponse.data.data?.deployed_rates || 0;
          
          if (DRY_RUN) {
            log(`   ✅ [DRY RUN] Would deploy ${deployedRates} rates`);
          } else {
            log(`   ✅ Success: ${deployedRates} rates deployed`);
          }
          
          successCount++;
          totalRatesDeployed += deployedRates;
        } else {
          // Show detailed error information
          const errorMsg = deployResponse.data?.error || JSON.stringify(deployResponse.data) || `HTTP ${deployResponse.status}`;
          log(`   ❌ Failed: ${errorMsg}`);
          failureCount++;
        }
      } catch (error) {
        log(`   ❌ Error: ${error.message}`);
        failureCount++;
      }
    }

    // Step 3: Generate simple report
    if (DRY_RUN) {
      log('\n🔍 DRY RUN SIMULATION COMPLETE');
    } else {
      log('\n🎉 DEPLOYMENT COMPLETE');
    }
    log('============================================================');
    log(`📊 Total Zones: ${zones.length}`);
    log(`✅ Successful: ${successCount}`);
    log(`❌ Failed: ${failureCount}`);
    
    if (DRY_RUN) {
      log(`📦 Total Rates That Would Be Deployed: ${totalRatesDeployed}`);
    } else {
      log(`📦 Total Rates Deployed: ${totalRatesDeployed}`);
    }
    
    const successRate = Math.round((successCount / zones.length) * 100);
    log(`📈 Success Rate: ${successRate}%`);

    if (successRate >= 90) {
      log('\n🎉 EXCELLENT: ' + (DRY_RUN ? 'Simulation' : 'Deployment') + ' highly successful!');
    } else if (successRate >= 70) {
      log('\n👍 GOOD: Most zones ' + (DRY_RUN ? 'simulated' : 'deployed') + ' successfully');
    } else {
      log('\n⚠️  ATTENTION: Multiple ' + (DRY_RUN ? 'simulation' : 'deployment') + ' failures detected');
    }

    if (DRY_RUN) {
      log('\n🎯 NEXT STEPS:');
      log('   1. Review the simulation results');
      log('   2. If satisfied, run without the --dry-run flag to deploy to Shopify');
      log(`   3. Full simulation log saved to: ${LOG_FILE}`);
    } else {
      log('\n🎯 NEXT STEPS:');
      log('   1. Check Shopify Admin: Settings → Shipping and delivery');
      log('   2. Verify rates show custom descriptions and weight ranges');
      log('   3. Test checkout with different package weights');
    }
    
    log('\n============================================================');
    if (DRY_RUN) {
      log('🔍 DRY RUN COMPLETE - NO CHANGES MADE TO SHOPIFY');
    } else {
      log('🏁 DEPLOYMENT COMPLETE');
    }

  } catch (error) {
    log('\n❌ CRITICAL ERROR: ' + error.message);
    log('   Make sure your dev server is running on localhost:3000');
    process.exit(1);
  }
}

// Run the script
if (DRY_RUN) {
  log('Starting dry run simulation...\n');
} else {
  log('Starting deployment process...\n');
}
deployShippingRates();
