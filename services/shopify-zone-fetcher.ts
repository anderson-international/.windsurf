import { ShopifyConfig } from './shopify-config'

interface ShopifyZone {
  id: string
  name: string
}

interface ShopifyZoneResponse {
  data: {
    shop: {
      shippingZones: {
        edges: Array<{
          node: {
            id: string
            name: string
          }
        }>
      }
    }
  }
}

export class ShopifyZoneFetcher {
  private readonly config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
  }

  async fetchAllZones(): Promise<ShopifyZone[]> {
    const query = `
      query GetShippingZones {
        shop {
          shippingZones(first: 50) {
            edges {
              node {
                id
                name
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
      
      return data.data.shop.shippingZones.edges.map(edge => ({
        id: edge.node.id,
        name: edge.node.name
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to fetch Shopify zones: ${errorMessage}`)
    }
  }
}
