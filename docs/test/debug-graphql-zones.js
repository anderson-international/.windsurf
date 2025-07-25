require('dotenv').config()

async function debugGraphQLResponse() {
  const response = await fetch(`${process.env.SHOPIFY_STORE_URL}/admin/api/${process.env.SHOPIFY_API_VERSION || '2025-01'}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify({
      query: `{
        deliveryProfiles(first: 250) {
          edges {
            node {
              id
              name
              profileLocationGroups {
                locationGroup {
                  id
                  locations(first: 250) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
                locationGroupZones(first: 250) {
                  edges {
                    node {
                      zone {
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
      }`
    })
  })

  return await response.json()
}

async function main() {
  try {
    console.log('🔍 Debugging GraphQL response structure...\n')
    
    const response = await debugGraphQLResponse()
    
    console.log('📋 Full GraphQL Response:')
    console.log(JSON.stringify(response, null, 2))
    
    console.log('\n🎯 Checking data structure:')
    console.log('- response.data exists:', !!response.data)
    console.log('- response.data.deliveryProfiles exists:', !!(response.data && response.data.deliveryProfiles))
    console.log('- response.errors:', response.errors)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main()
