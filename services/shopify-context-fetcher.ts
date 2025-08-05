import { ShopifyGraphQLClient } from './shopify-graphql-client'
import type { ShopifyConfig, ShopifyContext } from './shopify-config'
import { ZoneContextResponse } from '../types/shopify-query-responses'

// Module-level cache that persists across all instances
let profileDataCache: ZoneContextResponse | null = null

export class ShopifyContextFetcher {
  private readonly graphqlClient: ShopifyGraphQLClient

  constructor(config: ShopifyConfig) {
    this.graphqlClient = new ShopifyGraphQLClient(config)
  }
  
  // Clear cache method for testing or forced refresh
  static clearCache() {
    profileDataCache = null
  }

  async fetchAllZoneContexts(): Promise<ZoneContextResponse> {
    // Return cached data if available
    if (profileDataCache) {
      console.log('📦 Using cached profile data')
      return profileDataCache
    }
    
    console.log('🔍 Fetching all zone contexts from General Profile (single API call)...')
    
    const query = `
      query GetZoneContext {
        deliveryProfiles(first: 50) {
          edges {
            node {
              id
              default
              profileLocationGroups {
                locationGroup {
                  id
                }
                locationGroupZones(first: 100) {
                  edges {
                    node {
                      zone {
                        id
                        name
                      }
                      methodDefinitions(first: 250) {
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

    const response = await this.graphqlClient.executeQuery<ZoneContextResponse>(query)
    console.log(`✅ Fetched zone contexts from Shopify - caching for future use`)
    profileDataCache = response  // Cache the response
    return response
  }

  async fetchShopifyContextByZoneName(zoneName: string): Promise<ShopifyContext> {
    // Always use cached data if available, otherwise fetch once
    const response = await this.fetchAllZoneContexts()
    
    for (const profileEdge of response.deliveryProfiles.edges) {
      const profile = profileEdge.node
      
      for (const locationGroup of profile.profileLocationGroups) {
        for (const zoneEdge of locationGroup.locationGroupZones.edges) {
          const zoneNode = zoneEdge.node
          
          if (zoneNode.zone.name === zoneName) {
            const existingMethodDefinitionIds = zoneNode.methodDefinitions.edges.map(
              (edge: { node: { id: string } }) => edge.node.id
            )
            
            return {
              profileId: profile.id,
              locationGroupId: locationGroup.locationGroup.id,
              zoneId: zoneNode.zone.id,
              zoneName: zoneNode.zone.name,
              existingMethodDefinitionIds
            }
          }
        }
      }
    }
    
    throw new Error(`Zone "${zoneName}" not found in any delivery profile`)
  }
}
