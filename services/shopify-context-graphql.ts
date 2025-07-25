import { ShopifyConfig } from './shopify-config'
import { ShopifyContext } from './rate-transformer'
import { ZoneContextResponse } from '../types/shopify-query-responses'

export class ShopifyContextGraphQL {
  private readonly config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
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

    const response = await this.executeGraphQLQuery<ZoneContextResponse>(query)
    
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

  private async executeGraphQLQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(
      `${this.config.storeUrl}/admin/api/${this.config.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.config.adminAccessToken,
        },
        body: JSON.stringify({ query, variables }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    return data.data
  }
}
