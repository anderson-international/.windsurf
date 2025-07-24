/**
 * Test to check if zone field is available on DeliveryLocationGroupZone
 */

require('dotenv').config()

async function testZoneField() {
  console.log('🔍 Testing zone field availability on DeliveryLocationGroupZone...\n')

  try {
    const config = {
      storeUrl: process.env.SHOPIFY_STORE_URL || '',
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }

    if (!config.storeUrl || !config.adminAccessToken) {
      throw new Error('Missing environment variables')
    }

    // Test query with zone field
    const queryWithZone = `
      query {
        deliveryProfiles(first: 1) {
          edges {
            node {
              id
              name
              profileLocationGroups {
                locationGroup {
                  id
                }
                locationGroupZones(first: 1) {
                  edges {
                    node {
                      zone {
                        id
                        name
                      }
                      methodDefinitions(first: 1) {
                        edges {
                          node {
                            id
                            name
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

    console.log(`📡 Testing API Version: ${config.apiVersion}`)
    console.log('📨 Testing query WITH zone field...')

    const response = await fetch(
      `${config.storeUrl}/admin/api/${config.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config.adminAccessToken,
        },
        body: JSON.stringify({ query: queryWithZone }),
      }
    )

    const result = await response.json()

    if (result.errors) {
      console.log('❌ Query WITH zone field FAILED:')
      console.log(`Error: ${result.errors[0].message}`)
      
      // Test query without zone field
      console.log('\n📨 Testing query WITHOUT zone field...')
      
      const queryWithoutZone = `
        query {
          deliveryProfiles(first: 1) {
            edges {
              node {
                id
                name
                profileLocationGroups {
                  locationGroup {
                    id
                  }
                  locationGroupZones(first: 1) {
                    edges {
                      node {
                        methodDefinitions(first: 1) {
                          edges {
                            node {
                              id
                              name
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

      const response2 = await fetch(
        `${config.storeUrl}/admin/api/${config.apiVersion}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': config.adminAccessToken,
          },
          body: JSON.stringify({ query: queryWithoutZone }),
        }
      )

      const result2 = await response2.json()

      if (result2.errors) {
        console.log('❌ Query WITHOUT zone field also FAILED:')
        console.log(`Error: ${result2.errors[0].message}`)
      } else {
        console.log('✅ Query WITHOUT zone field SUCCEEDED')
        console.log('📊 Available fields on DeliveryLocationGroupZone:')
        console.log('- methodDefinitions ✅')
        console.log('- zone ❌ (Not available)')
      }
    } else {
      console.log('✅ Query WITH zone field SUCCEEDED!')
      console.log('📊 Zone information IS available:')
      const profile = result.data.deliveryProfiles.edges[0]?.node
      if (profile) {
        const zone = profile.profileLocationGroups[0]?.locationGroupZones?.edges[0]?.node?.zone
        if (zone) {
          console.log(`Zone ID: ${zone.id}`)
          console.log(`Zone Name: ${zone.name}`)
        }
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testZoneField()
