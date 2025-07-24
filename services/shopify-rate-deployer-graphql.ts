import { ShippingRate } from '../types/api'
import { ShopifyConfig } from './shopify-config'
import { DeliveryProfileUpdateResponse } from '../types/shopify-mutation-responses'
import { DeliveryProfileInput } from '../types/shopify-inputs'

export class ShopifyRateDeployerGraphQL {
  private readonly config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
  }

  async updateProfileWithRates(
    profileId: string, 
    locationGroupId: string, 
    zoneId: string, 
    rates: ShippingRate[],
    existingMethodDefinitionIds: string[]
  ): Promise<void> {
    const mutation = `
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

    const profileInput: DeliveryProfileInput = {
      methodDefinitionsToDelete: existingMethodDefinitionIds,
      locationGroupsToUpdate: [{
        id: locationGroupId,
        zonesToUpdate: [{
          id: zoneId,
          methodDefinitionsToCreate: rates.map(rate => ({
            name: rate.title,
            rateDefinition: {
              price: {
                amount: rate.price.toString(),
                currencyCode: rate.currency
              }
            }
          }))
        }]
      }]
    }

    const response = await this.executeGraphQLQuery<DeliveryProfileUpdateResponse>(mutation, {
      id: profileId,
      profile: profileInput
    })
    
    if (response.deliveryProfileUpdate?.userErrors?.length > 0) {
      const errors = response.deliveryProfileUpdate.userErrors
      throw new Error(`Shopify API errors: ${errors.map((e: { message: string }) => e.message).join(', ')}`)
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    return data.data
  }
}
