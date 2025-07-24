require('dotenv').config()

async function testApiEndpoints() {
  console.log('🧪 Comprehensive API Endpoint Test Suite')
  console.log('========================================\n')

  console.log('🔧 Environment Variable Validation')
  console.log('----------------------------------')
  
  const envVars = {
    SHOPIFY_STORE_URL: process.env.SHOPIFY_STORE_URL,
    SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
    SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
    DATABASE_URL: process.env.DATABASE_URL
  }

  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌'
    console.log(`${status} ${key}: ${value ? 'SET' : 'MISSING'}`)
  })

  const shopifyToken = envVars.SHOPIFY_ACCESS_TOKEN || envVars.SHOPIFY_ADMIN_ACCESS_TOKEN
  const hasShopifyConfig = envVars.SHOPIFY_STORE_URL && shopifyToken

  console.log(`\n📊 Shopify Config Status: ${hasShopifyConfig ? '✅ READY' : '❌ INCOMPLETE'}\n`)

  const tests = [
    {
      name: 'GET /api/rates/count - Check Generated Rates',
      method: 'GET',
      endpoint: '/api/rates/count',
      expectedFields: ['generated_rates', 'timestamp']
    },
    {
      name: 'POST /api/rates/deploy - Deploy to Shopify',
      method: 'POST', 
      endpoint: '/api/rates/deploy',
      expectedFields: ['data', 'timestamp'],
      requiresShopify: true
    }
  ]

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`)
    console.log('-'.repeat(60))
    
    if (test.requiresShopify && !hasShopifyConfig) {
      console.log('⏭️  SKIPPED: Missing Shopify configuration')
      continue
    }

    try {
      const response = await fetch(`http://localhost:3000${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseText = await response.text()
      console.log(`📡 Status: ${response.status} ${response.statusText}`)
      
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log('✅ Valid JSON Response:')
        console.log(JSON.stringify(responseData, null, 2))
      } catch (parseError) {
        console.log('❌ Invalid JSON Response:')
        console.log(responseText)
        continue
      }

      const missingFields = test.expectedFields.filter(field => !(field in responseData))
      if (missingFields.length === 0) {
        console.log('✅ All expected fields present')
      } else {
        console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`)
      }

      if (response.ok) {
        console.log('✅ Request successful')
      } else {
        console.log(`❌ Request failed: ${responseData.error || 'Unknown error'}`)
      }

    } catch (error) {
      console.log(`❌ Network error: ${error.message}`)
    }
  }

  if (hasShopifyConfig) {
    console.log('\n🔍 Direct Shopify API Validation')
    console.log('--------------------------------')
    await testShopifyDirect(envVars.SHOPIFY_STORE_URL, shopifyToken, envVars.SHOPIFY_API_VERSION)
  }

  console.log('\n🏁 Test Suite Complete')
}

async function testShopifyDirect(storeUrl, accessToken, apiVersion) {
  try {
    const query = `
      query {
        deliveryProfiles(first: 1) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `

    const response = await fetch(
      `${storeUrl}/admin/api/${apiVersion || '2024-01'}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL: ${result.errors[0].message}`)
    }

    console.log('✅ Shopify API connection successful')
    console.log(`📊 Found ${result.data.deliveryProfiles.edges.length} delivery profiles`)

  } catch (error) {
    console.log(`❌ Shopify API connection failed: ${error.message}`)
  }
}

if (require.main === module) {
  testApiEndpoints().catch(console.error)
}

module.exports = { testApiEndpoints }
