/**
 * Shipping Rates Deployment Script
 * 
 * Deploys generated shipping rates to all Shopify zones using the modern API.
 * Leverages the automated rate generation and deployment system.
 * 
 * Usage: 
 *   node scripts/deploy-shipping-rates.js  # Live deployment to Shopify
 */

require('dotenv').config();
const http = require('http');
const readline = require('readline');
const { resolveShopifyTargetForScripts } = require('./resolve-shopify-target');

// Configuration
const CONFIG = {
  hostname: 'localhost',
  port: 3000,
  timeout: 200000 // ~3m20s timeout for deployment (based on dry-run timings + buffer)
};

function log(message) {
  console.log(message);
}

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      ...options,
      timeout: options.timeout || CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: { error: 'Invalid JSON response', raw: data }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function deployAllZones() {
  log('============================================================');
  log('🚀 SHOPIFY SHIPPING RATES DEPLOYMENT - LIVE');
  log('============================================================\n');

  try {
    // Resolve and confirm target
    const { target, storeUrl } = resolveShopifyTargetForScripts();
    log(`🎯 Target: ${target} — ${storeUrl}`);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => rl.question(`Type the exact target name to confirm LIVE deployment to ${storeUrl}: `, resolve));
    rl.close();
    if (String(answer).trim().toUpperCase() !== target) {
      log('⚠️ Aborted by user.');
      process.exit(0);
    }

    log('📊 Deploying rates to all Shopify zones...');
    log('⏳ This may take a few minutes...\n');
    const __start = Date.now();

    // Start lightweight progress polling (every ~2s)
    const startProgressPolling = () => {
      let printed = 0;
      const interval = setInterval(async () => {
        try {
          const resp = await makeRequest({
            hostname: CONFIG.hostname,
            port: CONFIG.port,
            path: '/api/rates/progress',
            method: 'GET',
            timeout: 3000
          });
          if (resp.status !== 200) return;
          const s = resp.data || {};
          const completed = Array.isArray(s.completed) ? s.completed : [];
          for (let i = printed; i < completed.length; i++) {
            const z = completed[i] || {};
            const status = z.success ? '✅' : '❌';
            const rates = z.success && typeof z.rates_deployed === 'number' ? ` (${z.rates_deployed} rates)` : '';
            const durationStr = typeof z.duration_ms === 'number' ? ` — ${(z.duration_ms / 1000).toFixed(1)}s` : '';
            log(`   ${status} ${z.zone_name || 'Zone'}${rates}${durationStr}`);
          }
          printed = completed.length;
          if (s.done && (s.total_zones ? printed >= s.total_zones : true)) {
            clearInterval(interval);
          }
        } catch (_) {
          // Swallow polling errors; keep trying
        }
      }, 2000);
      return () => clearInterval(interval);
    };
    const stopPolling = startProgressPolling();
    const deployResponse = await makeRequest({
      hostname: CONFIG.hostname,
      port: CONFIG.port,
      path: '/api/rates/deploy-all-zones',
      method: 'POST'
    });
    // Stop progress polling once server responds
    try { stopPolling(); } catch {}

    if (deployResponse.status !== 200) {
      throw new Error(`HTTP ${deployResponse.status}: ${JSON.stringify(deployResponse.data)}`);
    }

    const result = deployResponse.data;

    if (!result.success) {
      throw new Error(result.error || 'Deployment failed');
    }

    // Display results
    log('============================================================');
    log('🎉 DEPLOYMENT COMPLETE:');
    log('============================================================');
    
    log(`📊 Total zones processed: ${result.total_zones_processed}`);
    log(`✅ Successful deployments: ${result.successful_deployments}`);
    log(`❌ Failed deployments: ${result.failed_deployments}`);
    
    if (false && result.results && result.results.length > 0) {
      log('\n📋 Zone-by-zone results:');
      result.results.forEach((zoneResult, index) => {
        const status = zoneResult.success ? '✅' : '❌';
        const rates = zoneResult.success ? ` (${zoneResult.rates_deployed} rates)` : '';
        const durationStr = typeof zoneResult.duration_ms === 'number' ? ` — ${(zoneResult.duration_ms / 1000).toFixed(1)}s` : '';
        log(`   ${index + 1}. ${status} ${zoneResult.zone_name}${rates}${durationStr}`);
        
        if (!zoneResult.success && zoneResult.error) {
          log(`      Error: ${zoneResult.error}`);
        }
      });
    }
    const __end = Date.now();
    const totalElapsedSec = ((__end - __start) / 1000).toFixed(1);
    log(`\n⏱ Total elapsed time: ${totalElapsedSec}s`);

    log('\n============================================================');
    log('🎉 LIVE DEPLOYMENT COMPLETE');
    if (result.successful_deployments > 0) {
      log('✅ Shipping rates are now live in Shopify');
    }
    
    log('============================================================');

    // Exit with appropriate code
    process.exit(result.failed_deployments > 0 ? 1 : 0);

  } catch (error) {
    log('\n============================================================');
    log('❌ DEPLOYMENT FAILED');
    log('============================================================');
    log(`Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      log('\n💡 Make sure the development server is running:');
      log('   npm run dev');
    }
    
    log('============================================================');
    process.exit(1);
  }
}

// Run the deployment
deployAllZones();
