import { GeneratedRate } from '../types/rate-generation'
import { ShippingRate } from '../types/api'
import { ShopifyConfig } from './shopify-config'
import { ShopifyContext, RateTransformer } from './rate-transformer'
import { ShopifyRateDeployerGraphQL } from './shopify-rate-deployer-graphql'

export class ShopifyRateDeployer {
  private readonly transformer: RateTransformer
  private readonly graphqlService: ShopifyRateDeployerGraphQL

  constructor(config: ShopifyConfig) {
    this.transformer = new RateTransformer()
    this.graphqlService = new ShopifyRateDeployerGraphQL(config)
  }

  async deployZoneRates(zoneId: string, rates: GeneratedRate[], context: ShopifyContext): Promise<void> {
    const shippingRates: ShippingRate[] = rates.map((rate, index) => ({
      id: `${zoneId}-${index}`,
      title: rate.rate_title,
      profileName: 'Default',
      zoneId: zoneId,
      zoneName: rate.zone_name,
      currency: 'GBP',
      price: Number(rate.calculated_price),
      deliveryDescription: rate.delivery_description,
      weightMin: Number(rate.weight_min),
      weightMax: Number(rate.weight_max)
    }))

    await this.graphqlService.updateProfileWithRates(
      context.profileId, 
      context.locationGroupId, 
      zoneId, 
      shippingRates,
      context.existingMethodDefinitionIds
    )
  }

  async updateProfileWithRates(
    profileId: string, 
    locationGroupId: string, 
    zoneId: string, 
    rates: ShippingRate[],
    existingMethodDefinitionIds: string[]
  ): Promise<void> {
    return this.graphqlService.updateProfileWithRates(
      profileId,
      locationGroupId,
      zoneId,
      rates,
      existingMethodDefinitionIds
    )
  }
}
