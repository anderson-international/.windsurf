import { ShopifyDeliveryProfilesResponse } from '../types/shopify'
import { GET_DELIVERY_PROFILES_QUERY } from '../queries/delivery-profiles'

interface ShopifyConfig {
  storeUrl: string
  adminAccessToken: string
  apiVersion: string
}

class ShopifyAPIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShopifyAPIError'
  }
}

export class ShopifyService {
  private config: ShopifyConfig

  constructor() {
    this.config = {
      storeUrl: process.env.SHOPIFY_STORE_URL || '',
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }
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
      throw new ShopifyAPIError(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new ShopifyAPIError(data.errors[0].message)
    }

    return data.data
  }
  async getDeliveryProfiles(): Promise<ShopifyDeliveryProfilesResponse> {
    return this.executeGraphQLQuery(GET_DELIVERY_PROFILES_QUERY)
  }
}
