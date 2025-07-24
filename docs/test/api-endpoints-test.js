const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS = [];

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function logTest(testName, status, details) {
  const timestamp = new Date().toISOString();
  const result = {
    test: testName,
    status: status,
    timestamp: timestamp,
    details: details
  };
  
  TEST_RESULTS.push(result);
  
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} [${timestamp}] ${testName}: ${status}`);
  
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
  console.log('');
}

async function testGetShippingRates() {
  try {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/shipping-rates');
    const duration = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      const { success, data, meta } = response.body;
      
      if (success && Array.isArray(data)) {
        logTest('GET /api/shipping-rates', 'PASS', {
          statusCode: response.statusCode,
          dataCount: data.length,
          hasMetadata: !!meta,
          duration: `${duration}ms`,
          sampleRate: data[0] ? {
            id: data[0].id,
            title: data[0].title,
            currency: data[0].currency,
            price: data[0].price
          } : null
        });
      } else {
        logTest('GET /api/shipping-rates', 'FAIL', {
          reason: 'Invalid response format',
          body: response.body
        });
      }
    } else {
      logTest('GET /api/shipping-rates', 'FAIL', {
        statusCode: response.statusCode,
        body: response.body
      });
    }
  } catch (error) {
    logTest('GET /api/shipping-rates', 'ERROR', {
      error: error.message
    });
  }
}

async function testGetZones() {
  try {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/zones');
    const duration = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      const { success, data, meta } = response.body;
      
      if (success && Array.isArray(data)) {
        logTest('GET /api/zones', 'PASS', {
          statusCode: response.statusCode,
          zoneCount: data.length,
          hasMetadata: !!meta,
          duration: `${duration}ms`,
          sampleZone: data[0] ? {
            id: data[0].id,
            name: data[0].name,
            profileName: data[0].profileName
          } : null
        });
      } else {
        logTest('GET /api/zones', 'FAIL', {
          reason: 'Invalid response format',
          body: response.body
        });
      }
    } else {
      logTest('GET /api/zones', 'FAIL', {
        statusCode: response.statusCode,
        body: response.body
      });
    }
  } catch (error) {
    logTest('GET /api/zones', 'ERROR', {
      error: error.message
    });
  }
}

async function testPostShippingRatesValid() {
  try {
    const sampleRates = [
      {
        title: "Standard Shipping - Test",
        zoneId: "gid://shopify/DeliveryZone/1",
        currency: "USD",
        price: 9.99
      },
      {
        title: "Express Shipping - Test", 
        zoneId: "gid://shopify/DeliveryZone/1",
        currency: "USD",
        price: 19.99
      }
    ];

    const testData = {
      profileId: "gid://shopify/DeliveryProfile/1",
      rates: sampleRates
    };

    const startTime = Date.now();
    const response = await makeRequest('POST', '/api/shipping-rates', testData);
    const duration = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      const { success, data, meta } = response.body;
      
      if (success) {
        logTest('POST /api/shipping-rates (Valid Data)', 'PASS', {
          statusCode: response.statusCode,
          message: data?.message,
          ratesProcessed: meta?.totalCount,
          duration: `${duration}ms`
        });
      } else {
        logTest('POST /api/shipping-rates (Valid Data)', 'FAIL', {
          reason: 'Request marked as unsuccessful',
          body: response.body
        });
      }
    } else {
      logTest('POST /api/shipping-rates (Valid Data)', 'FAIL', {
        statusCode: response.statusCode,
        body: response.body
      });
    }
  } catch (error) {
    logTest('POST /api/shipping-rates (Valid Data)', 'ERROR', {
      error: error.message
    });
  }
}

async function testPostShippingRatesInvalid() {
  try {
    const invalidData = {
      profileId: "",
      rates: "not-an-array"
    };

    const startTime = Date.now();  
    const response = await makeRequest('POST', '/api/shipping-rates', invalidData);
    const duration = Date.now() - startTime;
    
    if (response.statusCode === 400) {
      const { success, error } = response.body;
      
      if (!success && error) {
        logTest('POST /api/shipping-rates (Invalid Data)', 'PASS', {
          statusCode: response.statusCode,
          errorMessage: error,
          duration: `${duration}ms`,
          note: 'Correctly rejected invalid data'
        });
      } else {
        logTest('POST /api/shipping-rates (Invalid Data)', 'FAIL', {
          reason: 'Should have failed validation',
          body: response.body
        });
      }
    } else {
      logTest('POST /api/shipping-rates (Invalid Data)', 'WARN', {
        statusCode: response.statusCode,
        body: response.body,
        note: 'Expected 400 status code for invalid data'
      });
    }
  } catch (error) {
    logTest('POST /api/shipping-rates (Invalid Data)', 'ERROR', {
      error: error.message
    });
  }
}

async function runAllTests() {
  console.log('🚀 Starting Shopify Shipping API Tests...\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Test started at: ${new Date().toISOString()}\n`);
  
  // Test all endpoints
  await testGetShippingRates();
  await testGetZones();
  await testPostShippingRatesValid();
  await testPostShippingRatesInvalid();
  
  // Summary
  const passed = TEST_RESULTS.filter(r => r.status === 'PASS').length;
  const failed = TEST_RESULTS.filter(r => r.status === 'FAIL').length;
  const errors = TEST_RESULTS.filter(r => r.status === 'ERROR').length;
  const warnings = TEST_RESULTS.filter(r => r.status === 'WARN').length;
  
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`💥 Errors: ${errors}`);
  console.log(`📝 Total Tests: ${TEST_RESULTS.length}`);
  
  if (failed > 0 || errors > 0) {
    console.log('\n🔍 FAILED/ERROR TESTS:');
    TEST_RESULTS
      .filter(r => r.status === 'FAIL' || r.status === 'ERROR')
      .forEach(result => {
        console.log(`- ${result.test}: ${result.status}`);
        if (result.details) {
          console.log(`  ${JSON.stringify(result.details, null, 2)}`);
        }
      });
  }
  
  console.log(`\n🏁 Testing completed at: ${new Date().toISOString()}`);
  
  // Exit with appropriate code
  process.exit(failed > 0 || errors > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
