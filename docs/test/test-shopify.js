/**
 * Simple Shopify Data Test
 * Run with: node docs/test/test-shopify.js
 */

require('dotenv').config()

async function testShopifyData() {
  console.log('🔍 Testing Shopify API Data Structure...\n')

  try {
    // Shopify config from environment
    const config = {
      storeUrl: process.env.SHOPIFY_STORE_URL || '',
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }

    if (!config.storeUrl || !config.adminAccessToken) {
      throw new Error('Missing SHOPIFY_STORE_URL or SHOPIFY_ACCESS_TOKEN environment variables')
    }

    console.log(`📡 Connecting to: ${config.storeUrl}`)
    console.log(`📡 API Version: ${config.apiVersion}\n`)

    // Optimized Shopify GraphQL query - focused on comprehensive rates per zone
    const query = `
      query {
        deliveryProfiles(first: 10) {
          edges {
            node {
              name
              profileLocationGroups {
                locationGroupZones(first: 50) {
                  edges {
                    node {
                      methodDefinitions(first: 150) {
                        edges {
                          node {
                            rateProvider {
                              ... on DeliveryRateDefinition {
                                id
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    console.log('📨 Sending GraphQL query...')

    // Make request
    const response = await fetch(
      `${config.storeUrl}/admin/api/${config.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config.adminAccessToken,
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL Error: ${result.errors[0].message}`)
    }

    const data = result.data
    console.log('✅ Data received successfully!\n')

    // Display structure
    console.log('📊 DATA STRUCTURE:')
    console.log('='.repeat(60))
    console.log(`Total profiles: ${data.deliveryProfiles.edges.length}`)

    data.deliveryProfiles.edges.forEach((profile, profileIndex) => {
      const profileNode = profile.node
      console.log(`\n📋 PROFILE ${profileIndex + 1}:`)
      console.log(`  Name: ${profileNode.name}`)
      console.log(`  Location Groups: ${profileNode.profileLocationGroups.length}`)
      
      profileNode.profileLocationGroups.forEach((group, groupIndex) => {
        console.log(`  \n  🏢 Location Group ${groupIndex + 1}:`)
        console.log(`    Zones: ${group.locationGroupZones.edges.length}`)

        group.locationGroupZones.edges.forEach((zone, zoneIndex) => {
          const zoneNode = zone.node
          console.log(`    \n    🌍 Zone ${zoneIndex + 1}:`)
          console.log(`      Methods: ${zoneNode.methodDefinitions.edges.length}`)

          zoneNode.methodDefinitions.edges.forEach((method, methodIndex) => {
            const methodNode = method.node
            console.log(`      \n      📦 Shipping Rate ${methodIndex + 1}:`)
            
            if (methodNode.rateProvider) {
              console.log(`        Rate ID: ${methodNode.rateProvider.id}`)
              console.log(`        💰 Price: ${methodNode.rateProvider.price.amount} ${methodNode.rateProvider.price.currencyCode}`)
            } else {
              console.log(`        ⚠️ No rate provider found`)
            }
          })
        })
      })
    })

    console.log('\n' + '='.repeat(60))
    console.log('🔍 RAW JSON PAYLOAD:')
    console.log('='.repeat(60))
    console.log(JSON.stringify(data, null, 2))

    console.log('\n✅ Test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing Shopify data:')
    console.error(error.message)
    process.exit(1)
  }
}

// Run the test
testShopifyData()
