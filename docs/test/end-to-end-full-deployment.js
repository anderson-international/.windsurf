// 🚀 END-TO-END FULL DEPLOYMENT TEST
// Comprehensive test that regenerates and deploys rates for all zones

// Use built-in fetch (Node.js 18+) or polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

async function runEndToEndTest() {
  console.log('🚀 SHOPIFY SHIPPING RATES - END-TO-END DEPLOYMENT TEST');
  console.log('============================================================\n');
  
  const results = {
    zonesAnalyzed: 0,
    zonesDeployed: 0,
    totalRatesDeployed: 0,
    failures: [],
    successes: [],
    startTime: new Date()
  };

  try {
    // Step 1: Analyze all available zones
    console.log('📊 Step 1: Analyzing all available Shopify zones...');
    const zonesResponse = await fetch('http://localhost:3000/api/zones');
    const zonesResult = await zonesResponse.json();
    
    if (!zonesResult.success) {
      throw new Error(`Failed to fetch zones: ${zonesResult.error}`);
    }

    const zones = zonesResult.data;
    results.zonesAnalyzed = zones.length;
    console.log(`✅ Found ${zones.length} zones to process\n`);

    // Group zones by profile for better reporting
    const zonesByProfile = {};
    zones.forEach(zone => {
      if (!zonesByProfile[zone.profileName]) {
        zonesByProfile[zone.profileName] = [];
      }
      zonesByProfile[zone.profileName].push(zone);
    });

    console.log('📋 Zone Distribution:');
    Object.entries(zonesByProfile).forEach(([profileName, profileZones]) => {
      console.log(`   • ${profileName}: ${profileZones.length} zones`);
    });
    console.log('');

    // Step 2: Regenerate and deploy rates for each zone
    console.log('🔄 Step 2: Regenerating and deploying rates for all zones...\n');
    
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      console.log(`🎯 Processing Zone ${i + 1}/${zones.length}: ${zone.name} (${zone.id})`);
      
      try {
        // Check if zone has generated rates
        console.log(`   📋 Checking available rates for zone...`);
        const ratesCheckResponse = await fetch(`http://localhost:3000/api/rates?zone_id=${encodeURIComponent(zone.id)}`);
        const ratesCheckResult = await ratesCheckResponse.json();
        
        if (!ratesCheckResult.success || !ratesCheckResult.data?.length) {
          console.log(`   ⚠️  No rates found for this zone, skipping...`);
          results.failures.push({
            zone: zone.name,
            id: zone.id,
            error: 'No generated rates available'
          });
          continue;
        }

        const availableRates = ratesCheckResult.data.length;
        console.log(`   ✅ Found ${availableRates} generated rates`);

        // Deploy rates to Shopify
        console.log(`   🚀 Deploying rates to Shopify...`);
        const deployResponse = await fetch('http://localhost:3000/api/rates/deploy-zone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zone_id: zone.id
          })
        });

        const deployResult = await deployResponse.json();
        
        if (!deployResult.success) {
          throw new Error(deployResult.error || 'Deployment failed');
        }

        const deployedRates = deployResult.data?.deployed_rates || 0;
        console.log(`   ✅ Successfully deployed ${deployedRates} rates`);
        
        results.successes.push({
          zone: zone.name,
          id: zone.id,
          ratesDeployed: deployedRates,
          totalRates: availableRates
        });
        
        results.zonesDeployed++;
        results.totalRatesDeployed += deployedRates;

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        results.failures.push({
          zone: zone.name,
          id: zone.id,
          error: error.message
        });
      }
      
      console.log(''); // Spacing between zones
    }

    // Step 3: Final verification
    console.log('🔍 Step 3: Final verification...');
    
    // Check if we can fetch deployed rates from Shopify
    console.log('   📋 Verifying Shopify context resolution...');
    const contextResponse = await fetch('http://localhost:3000/api/shopify/context');
    const contextResult = await contextResponse.json();
    
    if (contextResult.success) {
      const totalMethodDefinitions = contextResult.data.reduce((sum, profile) => {
        return sum + profile.zones.reduce((zoneSum, zone) => {
          return zoneSum + (zone.existingMethodDefinitionIds?.length || 0);
        }, 0);
      }, 0);
      
      console.log(`   ✅ Shopify shows ${totalMethodDefinitions} total method definitions`);
    }

    // Step 4: Generate comprehensive report
    results.endTime = new Date();
    results.duration = Math.round((results.endTime - results.startTime) / 1000);
    
    generateFinalReport(results);

  } catch (error) {
    console.log(`\n❌ CRITICAL ERROR: ${error.message}`);
    console.log('   Full deployment test failed');
    results.endTime = new Date();
    generateFinalReport(results);
  }
}

function generateFinalReport(results) {
  console.log('\n🎉 END-TO-END DEPLOYMENT COMPLETE');
  console.log('============================================================');
  console.log(`⏱️  Total Duration: ${results.duration} seconds`);
  console.log(`📊 Zones Analyzed: ${results.zonesAnalyzed}`);
  console.log(`✅ Zones Successfully Deployed: ${results.zonesDeployed}`);
  console.log(`❌ Zones Failed: ${results.failures.length}`);
  console.log(`📦 Total Rates Deployed: ${results.totalRatesDeployed}`);
  
  if (results.successes.length > 0) {
    console.log('\n✅ SUCCESSFUL DEPLOYMENTS:');
    results.successes.forEach((success, index) => {
      console.log(`   ${index + 1}. ${success.zone}`);
      console.log(`      • Zone ID: ${success.id}`);
      console.log(`      • Rates Deployed: ${success.ratesDeployed}/${success.totalRates}`);
    });
  }
  
  if (results.failures.length > 0) {
    console.log('\n❌ FAILED DEPLOYMENTS:');
    results.failures.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.zone}`);
      console.log(`      • Zone ID: ${failure.id}`);
      console.log(`      • Error: ${failure.error}`);
    });
  }
  
  console.log('\n🎯 NEXT STEPS:');
  if (results.zonesDeployed > 0) {
    console.log('   1. ✅ Rates have been deployed to Shopify');
    console.log('   2. 🔍 Manual verification in Shopify Admin recommended:');
    console.log('      → Settings → Shipping and delivery');
    console.log('      → Check that rates show:');
    console.log('        • Custom delivery descriptions');
    console.log('        • Minimum/maximum weight ranges');
    console.log('        • Correct pricing');
    console.log('   3. 🧪 Test checkout with different weight ranges');
  }
  
  if (results.failures.length > 0) {
    console.log('   4. ⚠️  Review and fix failed zones before production use');
  }
  
  const successRate = Math.round((results.zonesDeployed / results.zonesAnalyzed) * 100);
  console.log(`\n📈 OVERALL SUCCESS RATE: ${successRate}% (${results.zonesDeployed}/${results.zonesAnalyzed})`);
  
  if (successRate >= 90) {
    console.log('🎉 EXCELLENT: Deployment highly successful!');
  } else if (successRate >= 70) {
    console.log('👍 GOOD: Most zones deployed successfully');
  } else {
    console.log('⚠️  ATTENTION NEEDED: Multiple deployment failures detected');
  }
  
  console.log('\n============================================================');
  console.log('🏁 END-TO-END TEST COMPLETED');
}

// Run the test
runEndToEndTest().catch(error => {
  console.error('❌ SCRIPT ERROR:', error);
  process.exit(1);
});
