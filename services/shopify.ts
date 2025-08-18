import { ShopifyDeliveryProfilesResponse } from '../types/shopify-query-responses'
import { DeliveryProfileUpdateResponse } from '../types/shopify-mutation-responses'
import { DeliveryProfileInput } from '../types/shopify-inputs'
import { GET_DELIVERY_PROFILES_QUERY } from '../queries/delivery-profiles'
import { resolveShopifyTarget } from './shopify-target-resolver'

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

  constructor(config?: ShopifyConfig) {
    if (config) {
      this.config = config
    } else {
      const resolved = resolveShopifyTarget()
      this.config = resolved.config
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

  async updateDeliveryProfile(profileId: string, profileInput: DeliveryProfileInput): Promise<DeliveryProfileUpdateResponse> {
    const query = `
      mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
        deliveryProfileUpdate(id: $id, profile: $profile) {
          profile {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `
    
    const variables = {
      id: profileId,
      profile: profileInput
    }
    
    return this.executeGraphQLQuery(query, variables)
  }
}
