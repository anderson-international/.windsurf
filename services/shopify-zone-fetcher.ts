import { ShopifyConfig } from './shopify-config'

interface ShopifyZone {
  id: string
  name: string
}

interface ShopifyZoneResponse {
  data: {
    deliveryProfiles: {
      edges: Array<{
        node: {
          id: string
          name: string
          default: boolean
          profileLocationGroups: Array<{
            locationGroup: {
              id: string
            }
            locationGroupZones: {
              edges: Array<{
                node: {
                  zone: {
                    id: string
                    name: string
                  }
                }
              }>
            }
          }>
        }
      }>
    }
  }
  errors?: Array<{
    message: string
  }>
}

export class ShopifyZoneFetcher {
  private readonly config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
  }

  async fetchAllZones(): Promise<ShopifyZone[]> {
    const query = `
      query GetShippingZones {
        deliveryProfiles(first: 10) {
          edges {
            node {
              id
              name
              default
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
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    try {
      const response = await fetch(
        `${this.config.storeUrl}/admin/api/${this.config.apiVersion}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.config.adminAccessToken
          },
          body: JSON.stringify({ query })
        }
      )

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
      }

      const data: ShopifyZoneResponse = await response.json()
      
      // Check for GraphQL errors
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map(err => err.message).join(', ')
        throw new Error(`GraphQL errors: ${errorMessages}`)
      }
      
      // Check if data structure exists
      if (!data.data || !data.data.deliveryProfiles) {
        throw new Error(`Invalid response structure: ${JSON.stringify(data)}`)
      }
      
      // Find the General Profile (default profile)
      const generalProfile = data.data.deliveryProfiles.edges.find(
        profileEdge => profileEdge.node.default === true
      )
      
      if (!generalProfile) {
        throw new Error('General Profile (default delivery profile) not found')
      }
      
      console.log(`📋 Found General Profile: "${generalProfile.node.name}" with ID: ${generalProfile.node.id}`)
      
      // Extract zones only from the General Profile
      const zones: ShopifyZone[] = []
      
      generalProfile.node.profileLocationGroups.forEach(locationGroup => {
        locationGroup.locationGroupZones.edges.forEach(zoneEdge => {
          const zone = zoneEdge.node.zone
          zones.push({
            id: zone.id,
            name: zone.name
          })
        })
      })
      
      console.log(`✅ Found ${zones.length} zones in General Profile: ${zones.map(z => z.name).join(', ')}`)
      
      return zones

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to fetch Shopify zones: ${errorMessage}`)
    }
  }
}
