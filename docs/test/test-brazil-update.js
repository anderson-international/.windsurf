/**
 * Test Script: Update Brazil Zone Shipping Rate to £9.99
 * 
 * This script will:
 * 1. Fetch delivery profiles and find Brazil zone
 * 2. Identify the shipping rate in Brazil zone
 * 3. Update that rate's price to £9.99
 * 4. Verify the update was successful
 */

require('dotenv').config()

async function testBrazilRateUpdate() {
  console.log('🇧🇷 Testing Brazil Zone Rate Update to £9.99...\n')

  try {
    const config = {
      storeUrl: process.env.SHOPIFY_STORE_URL || '',
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }

    if (!config.storeUrl || !config.adminAccessToken) {
      throw new Error('Missing environment variables')
    }

    const baseUrl = 'http://localhost:3000'

    // Step 1: Fetch all shipping rates and find Brazil zone rate
    console.log('📡 Step 1: Fetching shipping rates to find Brazil zone...')
    
    const ratesResponse = await fetch(`${baseUrl}/api/shipping-rates`)
    const ratesResult = await ratesResponse.json()

    if (!ratesResult.success) {
      throw new Error(`Failed to fetch rates: ${ratesResult.error}`)
    }

    // Find Brazil zone rates
    const brazilRates = ratesResult.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    )

    console.log(`🔍 Found ${brazilRates.length} rates in Brazil zone`)

    if (brazilRates.length === 0) {
      throw new Error('No rates found in Brazil zone')
    }

    // Display Brazil rates
    console.log('\n📋 Brazil Zone Rates:')
    brazilRates.forEach((rate, index) => {
      console.log(`  ${index + 1}. ID: ${rate.id}`)
      console.log(`     Title: ${rate.title}`)
      console.log(`     Profile: ${rate.profileName}`)
      console.log(`     Zone: ${rate.zoneName} (${rate.zoneId})`)
      console.log(`     Current Price: ${rate.currency} ${rate.price}`)
      console.log()
    })

    // Use the first Brazil rate for testing
    const targetRate = brazilRates[0]
    console.log(`🎯 Target Rate for Update:`)
    console.log(`   ID: ${targetRate.id}`)
    console.log(`   Title: ${targetRate.title}`)
    console.log(`   Current: ${targetRate.currency} ${targetRate.price}`)
    console.log(`   Target: GBP 9.99\n`)

    // Step 2: Fetch delivery profiles to get complete context
    console.log('📡 Step 2: Fetching delivery profiles for mutation context...')
    
    const profilesResponse = await fetch(`${baseUrl}/api/zones`)
    const profilesResult = await profilesResponse.json()

    if (!profilesResult.success) {
      throw new Error(`Failed to fetch profiles: ${profilesResult.error}`)
    }

    // Find the profile containing our target rate
    const targetProfile = profilesResult.data.find(zone => 
      zone.name && zone.name.toLowerCase().includes('brazil')
    )

    if (!targetProfile) {
      throw new Error('Could not find Brazil zone in profiles')
    }

    console.log(`🏪 Found Target Profile: ${targetProfile.profileName}`)
    console.log(`🌎 Found Target Zone: ${targetProfile.name} (${targetProfile.id})`)

    // Step 3: Prepare update payload
    console.log('\n📝 Step 3: Preparing update payload...')

    // We need to find the actual profile ID from the original data
    // Let's make direct GraphQL call to get full context
    const fullProfileQuery = `
      query {
        deliveryProfiles(first: 10) {
          edges {
            node {
              id
              name
              profileLocationGroups {
                locationGroup {
                  id
                }
                locationGroupZones(first: 50) {
                  edges {
                    node {
                      zone {
                        id
                        name
                      }
                      methodDefinitions(first: 150) {
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

    const graphqlResponse = await fetch(
      `${config.storeUrl}/admin/api/${config.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': config.adminAccessToken,
        },
        body: JSON.stringify({ query: fullProfileQuery }),
      }
    )

    const graphqlResult = await graphqlResponse.json()
    
    if (graphqlResult.errors) {
      throw new Error(`GraphQL Error: ${graphqlResult.errors[0].message}`)
    }

    // Find the exact profile, location group, and zone context
    let foundContext = null
    
    for (const profileEdge of graphqlResult.data.deliveryProfiles.edges) {
      const profile = profileEdge.node
      
      for (const locationGroup of profile.profileLocationGroups || []) {
        for (const zoneEdge of locationGroup.locationGroupZones?.edges || []) {
          const zoneNode = zoneEdge.node
          
          if (zoneNode.zone.name.toLowerCase().includes('brazil')) {
            for (const methodEdge of zoneNode.methodDefinitions?.edges || []) {
              const method = methodEdge.node
              
              if (method.id === targetRate.id) {
                foundContext = {
                  profileId: profile.id,
                  profileName: profile.name,
                  locationGroupId: locationGroup.locationGroup.id,
                  zoneId: zoneNode.zone.id,
                  zoneName: zoneNode.zone.name,
                  rateId: method.id,
                  rateName: method.name,
                  currentPrice: method.rateProvider?.price?.amount,
                  currentCurrency: method.rateProvider?.price?.currencyCode
                }
                break
              }
            }
          }
        }
      }
    }

    if (!foundContext) {
      throw new Error('Could not find complete context for Brazil rate')
    }

    console.log('✅ Found Complete Context:')
    console.log(`   Profile ID: ${foundContext.profileId}`)
    console.log(`   Profile Name: ${foundContext.profileName}`)
    console.log(`   Location Group ID: ${foundContext.locationGroupId}`)
    console.log(`   Zone ID: ${foundContext.zoneId}`)
    console.log(`   Zone Name: ${foundContext.zoneName}`)
    console.log(`   Rate ID: ${foundContext.rateId}`)
    console.log(`   Rate Name: ${foundContext.rateName}`)
    console.log(`   Current: ${foundContext.currentCurrency} ${foundContext.currentPrice}`)

    // Step 4: Perform the update
    console.log('\n🚀 Step 4: Updating Brazil rate to £9.99...')

    const updatePayload = {
      profileId: foundContext.profileId,
      rates: [
        {
          id: foundContext.rateId,
          title: foundContext.rateName,
          profileName: foundContext.profileName,
          zoneId: foundContext.zoneId,
          zoneName: foundContext.zoneName,
          currency: 'GBP',
          price: 9.99
        }
      ]
    }

    console.log('📦 Update Payload:')
    console.log(JSON.stringify(updatePayload, null, 2))

    const updateResponse = await fetch(`${baseUrl}/api/shipping-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    })

    const updateResult = await updateResponse.json()

    console.log(`\n📊 Update Response (${updateResponse.status}):`)
    console.log(JSON.stringify(updateResult, null, 2))

    if (updateResult.success) {
      console.log('\n✅ SUCCESS: Brazil rate updated to £9.99!')
      
      // Step 5: Verify the update
      console.log('\n🔍 Step 5: Verifying the update...')
      
      const verifyResponse = await fetch(`${baseUrl}/api/shipping-rates`)
      const verifyResult = await verifyResponse.json()
      
      const updatedRate = verifyResult.data.find(rate => rate.id === foundContext.rateId)
      
      if (updatedRate) {
        console.log('📋 Updated Rate Verification:')
        console.log(`   ID: ${updatedRate.id}`)
        console.log(`   Title: ${updatedRate.title}`)
        console.log(`   Zone: ${updatedRate.zoneName}`)
        console.log(`   New Price: ${updatedRate.currency} ${updatedRate.price}`)
        
        if (updatedRate.price === 9.99 && updatedRate.currency === 'GBP') {
          console.log('\n🎉 VERIFICATION SUCCESS: Rate successfully updated to £9.99!')
        } else {
          console.log('\n⚠️  VERIFICATION WARNING: Price may not have updated correctly')
        }
      } else {
        console.log('\n⚠️  Could not find updated rate for verification')
      }
      
    } else {
      console.log('\n❌ FAILURE: Rate update failed')
      console.log(`Error: ${updateResult.error}`)
    }

  } catch (error) {
    console.error('\n💥 Test failed:', error.message)
    process.exit(1)
  }
}

testBrazilRateUpdate()
