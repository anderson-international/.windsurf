import { GeneratedRate } from '../types/rate-generation'
import { ShopifyContext, ShopifyContextMap } from './rate-transformer'
import { ShopifyConfig } from './shopify-config'
import { ShopifyContextGraphQL } from './shopify-context-graphql'

export class ShopifyContextResolver {
  private readonly graphqlService: ShopifyContextGraphQL

  constructor(config: ShopifyConfig) {
    this.graphqlService = new ShopifyContextGraphQL(config)
  }

  async resolveContextsForRates(rates: GeneratedRate[]): Promise<ShopifyContextMap> {
    const uniqueZoneIds = [...new Set(rates.map(rate => rate.zone_id))]
    const contextMap: ShopifyContextMap = {}

    for (const zoneId of uniqueZoneIds) {
      try {
        contextMap[zoneId] = await this.graphqlService.fetchShopifyContext(zoneId)
      } catch (error) {
        throw new Error(`Failed to resolve context for zone ${zoneId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return contextMap
  }

  async fetchShopifyContextForZone(zoneId: string): Promise<ShopifyContext> {
    return this.graphqlService.fetchShopifyContext(zoneId)
  }
}
