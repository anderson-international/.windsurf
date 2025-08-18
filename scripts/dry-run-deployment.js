/**
 * Dry-Run Deployment Script
 * 
 * Previews what would be deployed to Shopify without making any changes.
 * Shows the exact GraphQL queries and variables that would be sent.
 * 
 * Usage: 
 *   node scripts/dry-run-deployment.js  # Preview deployment without changes
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { resolveShopifyTargetForScripts } = require('./resolve-shopify-target');

// Configuration
const CONFIG = {
  hostname: 'localhost',
  port: 3000,
  timeout: 120000 // 2 minutes timeout for analysis
};

function log(message) {
  console.log(message);
}

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      ...options,
      timeout: CONFIG.timeout,
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
      // Enhanced error details for better debugging
      const errorDetails = {
        message: error.message || 'Unknown error',
        code: error.code,
        syscall: error.syscall,
        errno: error.errno
      };
      
      let errorMessage = `Request failed: ${errorDetails.message}`;
      if (errorDetails.code) {
        errorMessage += ` (${errorDetails.code})`;
      }
      
      reject(new Error(errorMessage));
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

// Formatting helpers for Markdown output
function formatCurrencyGBP(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) return '£0.00';
  return `£${num.toFixed(2)}`;
}

function formatWeightKg(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0kg';
  // Keep up to 2 decimals like Shopify UI examples
  return `${Number(num.toFixed(2))}kg`;
}

function sanitizeTimestamp(ts) {
  return ts.replace(/[:.]/g, '-');
}

function buildMarkdownReport(orchestrationResult, timestamp) {
  const lines = [];
  lines.push('# Shopify Shipping Rates Dry-Run Preview');
  lines.push('');
  lines.push(`- Generated: ${timestamp}`);
  lines.push(`- Total zones analyzed: ${orchestrationResult.total_zones_processed}`);
  lines.push(`- Zones ready: ${orchestrationResult.successful_deployments}`);
  lines.push(`- Zones with issues: ${orchestrationResult.failed_deployments}`);
  lines.push('');

  if (!orchestrationResult.results || orchestrationResult.results.length === 0) {
    lines.push('_No zones returned in dry-run result._');
    return lines.join('\n');
  }

  for (const zoneResult of orchestrationResult.results) {
    lines.push(`## Zone: ${zoneResult.zone_name}`);
    const status = zoneResult.success ? '✅ Ready' : '❌ Issue';
    lines.push(`- Status: ${status}`);
    lines.push(`- Rates ready: ${zoneResult.rates_deployed} of ${zoneResult.total_rates_generated}`);
    if (!zoneResult.success && zoneResult.error) {
      lines.push(`- Issue: ${zoneResult.error}`);
    }

    const previewRates = zoneResult.preview?.rates || [];
    if (previewRates.length > 0) {
      // Group by title, then sort each group by weightMin asc
      const byTitle = new Map();
      for (const r of previewRates) {
        const key = r.title || 'Untitled';
        if (!byTitle.has(key)) byTitle.set(key, []);
        byTitle.get(key).push(r);
      }
      const sortedTitles = Array.from(byTitle.keys()).sort();
      for (const title of sortedTitles) {
        const group = byTitle.get(title).slice().sort((a, b) => Number(a.weightMin) - Number(b.weightMin));
        lines.push('');
        lines.push(`### ${title}`);
        lines.push('| Orders (kg) | Price |');
        lines.push('|---|---|');
        for (const r of group) {
          const range = `${formatWeightKg(r.weightMin)}–${formatWeightKg(r.weightMax)}`;
          const price = formatCurrencyGBP(r.price);
          lines.push(`| ${range} | ${price} |`);
        }
        lines.push('');
      }
    } else {
      lines.push('');
      lines.push('_No per-rate preview available for this zone._');
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function dryRunDeployment() {
  log('============================================================');
  log('🔍 SHOPIFY SHIPPING RATES DRY-RUN PREVIEW');
  log('============================================================\n');
  
  log('🔍 DRY RUN MODE: No changes will be made to Shopify');
  log('📋 This will show the exact GraphQL queries that would be executed\n');

  try {
    // Resolve and confirm target
    const { target, storeUrl } = resolveShopifyTargetForScripts();
    log(`🎯 Target: ${target} — ${storeUrl}`);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => rl.question(`Proceed with DRY RUN against ${target} (${storeUrl})? [y/N] `, resolve));
    rl.close();
    if (!/^y(es)?$/i.test(String(answer).trim())) {
      log('⚠️ Aborted by user.');
      process.exit(0);
    }

    log('📊 Analyzing deployment to all Shopify zones...');
    log('⏳ This may take a few minutes...\n');

    const deployResponse = await makeRequest({
      hostname: CONFIG.hostname,
      port: CONFIG.port,
      path: '/api/rates/deploy-all-zones',
      method: 'POST'
    }, { dry_run: true });

    if (deployResponse.status !== 200) {
      throw new Error(`HTTP ${deployResponse.status}: ${JSON.stringify(deployResponse.data)}`);
    }

    const result = deployResponse.data;

    if (!result.success) {
      throw new Error(result.error || 'Dry-run analysis failed');
    }

    // Display results
    log('============================================================');
    log('🔍 DRY-RUN ANALYSIS COMPLETE:');
    log('============================================================');
    
    log(`📊 Total zones analyzed: ${result.total_zones_processed}`);
    log(`✅ Zones ready for deployment: ${result.successful_deployments}`);
    log(`❌ Zones with issues: ${result.failed_deployments}`);
    
    if (result.results && result.results.length > 0) {
      log('\n📋 Zone-by-zone analysis:');
      result.results.forEach((zoneResult, index) => {
        const status = zoneResult.success ? '✅' : '❌';
        const rates = zoneResult.success ? ` (${zoneResult.rates_deployed} rates ready)` : '';
        log(`   ${index + 1}. ${status} ${zoneResult.zone_name}${rates}`);
        
        if (!zoneResult.success && zoneResult.error) {
          log(`      Issue: ${zoneResult.error}`);
        }
      });
    }

    // Write Markdown report to scripts/dry-run-output
    try {
      const ts = new Date().toISOString();
      const outDir = path.join(__dirname, 'dry-run-output');
      const filename = `dry-run-${sanitizeTimestamp(ts)}.md`;
      const outPath = path.join(outDir, filename);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const md = buildMarkdownReport(result, ts);
      fs.writeFileSync(outPath, md, 'utf8');
      log(`\n📝 Markdown report written to: ${outPath}`);
    } catch (writeErr) {
      log(`\n⚠️ Failed to write Markdown report: ${writeErr?.message || writeErr}`);
    }

    log('\n============================================================');
    log('🔍 DRY-RUN PREVIEW COMPLETE');
    log('📋 Check console output above for GraphQL queries that would be executed');
    log('💡 Run the live deployment script to perform actual deployment:');
    log('   node scripts/deploy-shipping-rates.js');
    log('============================================================');

    // Exit with appropriate code
    process.exit(result.failed_deployments > 0 ? 1 : 0);

  } catch (error) {
    log('\n============================================================');
    log('❌ DRY-RUN ANALYSIS FAILED');
    log('============================================================');
    log(`Error: ${error.message}`);
    
    // Check for various connection-related errors
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('econnrefused') || 
        errorMsg.includes('connection refused') ||
        errorMsg.includes('connect econnrefused') ||
        errorMsg.includes('request failed') && errorMsg.includes('econnrefused')) {
      log('\n💡 Make sure the development server is running:');
      log('   npm run dev');
    } else if (errorMsg.includes('enotfound') || errorMsg.includes('getaddrinfo')) {
      log('\n💡 Check hostname and port configuration:');
      log(`   Currently trying: ${CONFIG.hostname}:${CONFIG.port}`);
    } else if (errorMsg.includes('timeout')) {
      log('\n💡 Server might be running but not responding:');
      log('   Check if the server is fully started and responsive');
    } else {
      log('\n💡 If the development server isn\'t running, start it with:');
      log('   npm run dev');
    }
    
    log('============================================================');
    process.exit(1);
  }
}

// Run the dry-run analysis
dryRunDeployment();
