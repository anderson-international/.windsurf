import { ShopifyConfig } from './shopify-config'
import { ShopifyZone } from './zone-matcher-types'
import { ShopifyDeliveryProfilesResponse } from '../types/shopify-query-responses'

export class ZoneMatcherGraphQL {
  private readonly config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
  }

  async fetchShopifyZones(): Promise<ShopifyZone[]> {
    const query = `
      query GetAllZones {
        deliveryProfiles(first: 50) {
          edges {
            node {
              id
              name
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
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await this.executeGraphQLQuery<ShopifyDeliveryProfilesResponse>(query)
    const zones: ShopifyZone[] = []

    for (const profileEdge of response.deliveryProfiles.edges) {
      const profile = profileEdge.node

      for (const locationGroup of profile.profileLocationGroups) {
        for (const zoneEdge of locationGroup.locationGroupZones.edges) {
          const zone = zoneEdge.node.zone
          
          if (!zones.find(z => z.id === zone.id)) {
            zones.push({
              id: zone.id,
              name: zone.name
            })
          }
        }
      }
    }

    return zones
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
      throw new Error(`Shopify GraphQL HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`Shopify GraphQL Error: ${data.errors[0].message}`)
    }

    return data.data
  }
}
