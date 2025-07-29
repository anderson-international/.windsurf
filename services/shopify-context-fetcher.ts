import { ShopifyGraphQLClient } from './shopify-graphql-client'
import type { ShopifyConfig, ShopifyContext } from './shopify-config'
import { ZoneContextResponse } from '../types/shopify-query-responses'

export class ShopifyContextFetcher {
  private readonly graphqlClient: ShopifyGraphQLClient

  constructor(config: ShopifyConfig) {
    this.graphqlClient = new ShopifyGraphQLClient(config)
  }

  async fetchShopifyContext(zoneId: string): Promise<ShopifyContext> {
    const query = `
      query GetZoneContext {
        deliveryProfiles(first: 50) {
          edges {
            node {
              id
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
    
    for (const profileEdge of response.deliveryProfiles.edges) {
      const profile = profileEdge.node
      
      for (const locationGroup of profile.profileLocationGroups) {
        for (const zoneEdge of locationGroup.locationGroupZones.edges) {
          const zoneNode = zoneEdge.node
          
          if (zoneNode.zone.id === zoneId) {
            const existingMethodDefinitionIds = zoneNode.methodDefinitions.edges.map(
              (edge: { node: { id: string } }) => edge.node.id
            )
            
            return {
              profileId: profile.id,
              locationGroupId: locationGroup.locationGroup.id,
              zoneId: zoneId,
              zoneName: zoneNode.zone.name,
              existingMethodDefinitionIds
            }
          }
        }
      }
    }
    
    throw new Error(`Zone ${zoneId} not found in any delivery profile`)
  }

  async fetchShopifyContextByName(zoneName: string): Promise<ShopifyContext> {
    throw new Error(`fetchShopifyContextByName not yet implemented for zone: ${zoneName}`)
  }
}
