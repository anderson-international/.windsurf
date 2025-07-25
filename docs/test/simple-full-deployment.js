// 🚀 SIMPLE END-TO-END DEPLOYMENT TEST
// Uses only Node.js built-in modules - No external dependencies required

const http = require('http');

// Simple HTTP request helper using built-in modules
function makeRequest(options, postData = null) {
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

async function runSimpleDeploymentTest() {
  console.log('🚀 SIMPLE SHOPIFY SHIPPING DEPLOYMENT TEST');
  console.log('============================================================\n');
  
  try {
    // Step 1: Get all zones
    console.log('📊 Step 1: Getting all Shopify zones...');
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
    console.log(`✅ Found ${zones.length} zones\n`);

    // Step 2: Deploy rates for each zone
    let successCount = 0;
    let failureCount = 0;
    let totalRatesDeployed = 0;

    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      console.log(`🎯 Processing Zone ${i + 1}/${zones.length}: ${zone.name}`);

      try {
        // Deploy rates to this zone
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
        });

        if (deployResponse.status === 200 && deployResponse.data?.data?.success) {
          const deployedRates = deployResponse.data.data?.deployed_rates || 0;
          console.log(`   ✅ Success: ${deployedRates} rates deployed`);
          successCount++;
          totalRatesDeployed += deployedRates;
        } else {
          // Show detailed error information
          const errorMsg = deployResponse.data?.error || JSON.stringify(deployResponse.data) || `HTTP ${deployResponse.status}`;
          console.log(`   ❌ Failed: ${errorMsg}`);
          failureCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failureCount++;
      }
    }

    // Step 3: Generate simple report
    console.log('\n🎉 DEPLOYMENT COMPLETE');
    console.log('============================================================');
    console.log(`📊 Total Zones: ${zones.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📦 Total Rates Deployed: ${totalRatesDeployed}`);
    
    const successRate = Math.round((successCount / zones.length) * 100);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT: Deployment highly successful!');
    } else if (successRate >= 70) {
      console.log('\n👍 GOOD: Most zones deployed successfully');
    } else {
      console.log('\n⚠️  ATTENTION: Multiple deployment failures detected');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Check Shopify Admin: Settings → Shipping and delivery');
    console.log('   2. Verify rates show custom descriptions and weight ranges');
    console.log('   3. Test checkout with different package weights');
    
    console.log('\n============================================================');
    console.log('🏁 SIMPLE DEPLOYMENT TEST COMPLETED');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.log('   Make sure your dev server is running on localhost:3000');
    process.exit(1);
  }
}

// Run the test
console.log('Starting deployment test...\n');
runSimpleDeploymentTest();
