import { GeneratedRate } from '../types/rate-generation'
import { ShippingRate } from '../types/api'

export interface ShopifyContext {
  readonly profileId: string
  readonly locationGroupId: string
  readonly zoneId: string
  readonly existingMethodDefinitionIds: string[]
}

export interface ShopifyRateInput {
  readonly profileId: string
  readonly locationGroupId: string
  readonly zoneId: string
  readonly definition: {
    readonly name: string
    readonly description: string
    readonly rateDefinition: {
      readonly price: {
        readonly amount: string
        readonly currencyCode: string
      }
      readonly weightRange: {
        readonly greaterThanOrEqualTo: string
        readonly lessThan: string
      }
    }
  }
}

export interface ShopifyContextMap {
  [zoneId: string]: ShopifyContext
}

export class RateTransformer {
  groupRatesByZone(rates: GeneratedRate[]): Map<string, GeneratedRate[]> {
    const groupedRates = new Map<string, GeneratedRate[]>()
    
    rates.forEach(rate => {
      const existing = groupedRates.get(rate.zone_id) || []
      existing.push(rate)
      groupedRates.set(rate.zone_id, existing)
    })
    
    return groupedRates
  }

  transformRateToShopify(rate: GeneratedRate, context: ShopifyContext): ShopifyRateInput {
    return {
      profileId: context.profileId,
      locationGroupId: context.locationGroupId,
      zoneId: context.zoneId,
      definition: {
        name: rate.rate_title,
        description: rate.delivery_description,
        rateDefinition: {
          price: this.formatPriceForShopify(rate.calculated_price),
          weightRange: this.formatWeightRange(rate.weight_min, rate.weight_max)
        }
      }
    }
  }

  private formatPriceForShopify(price: number): { amount: string, currencyCode: string } {
    return {
      amount: price.toFixed(2),
      currencyCode: 'GBP'
    }
  }

  private formatWeightRange(min: number, max: number): { greaterThanOrEqualTo: string, lessThan: string } {
    return {
      greaterThanOrEqualTo: min.toFixed(2),
      lessThan: max.toFixed(2)
    }
  }

  transformRatesForZone(rates: GeneratedRate[], zoneId: string, zoneName: string): ShippingRate[] {
    return rates.map((rate, index) => ({
      id: `${rate.zone_id}-${index}`, // Generate a temporary ID using index
      title: rate.rate_title,
      profileName: 'Default',
      zoneId: rate.zone_id,
      zoneName: zoneName,
      currency: 'GBP',
      price: rate.calculated_price
    }))
  }

  transformRateBatch(rates: GeneratedRate[], contextMap: ShopifyContextMap): ShopifyRateInput[] {
    return rates
      .filter(rate => contextMap[rate.zone_id])
      .map(rate => this.transformRateToShopify(rate, contextMap[rate.zone_id]))
  }
}
