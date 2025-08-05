import { GeneratedRate } from '../types/rate-generation'
import { ShippingRate } from '../types/api'
import { ShopifyConfig, ShopifyContext } from './shopify-config'
import { ShopifyRateDeployerGraphQL } from './shopify-rate-deployer-graphql'

export class ShopifyRateDeployer {
  private readonly graphqlService: ShopifyRateDeployerGraphQL

  constructor(config: ShopifyConfig) {
    this.graphqlService = new ShopifyRateDeployerGraphQL(config)
  }

  async deployZoneRates(zoneId: string, rates: GeneratedRate[], context: ShopifyContext, dryRun: boolean = false): Promise<void> {
    const shippingRates: ShippingRate[] = rates.map((rate, index) => ({
      id: `${zoneId}-${index}`,
      title: rate.rate_title,
      profileName: 'Default',
      zoneId: zoneId,
      zoneName: context.zoneName,
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
      context.existingMethodDefinitionIds,
      dryRun
    )
  }

  async updateProfileWithRates(
    profileId: string, 
    locationGroupId: string, 
    zoneId: string, 
    rates: ShippingRate[],
    existingMethodDefinitionIds: string[],
    dryRun: boolean = false
  ): Promise<void> {
    return this.graphqlService.updateProfileWithRates(
      profileId,
      locationGroupId,
      zoneId,
      rates,
      existingMethodDefinitionIds,
      dryRun
    )
  }
}
