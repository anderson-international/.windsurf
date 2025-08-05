import type { ShopifyConfig, ShopifyContext } from './shopify-config'
import { ShopifyContextFetcher } from './shopify-context-fetcher'

export interface ShopifyContextMap {
  [zoneId: string]: ShopifyContext
}

export class ShopifyContextResolver {
  private readonly graphqlService: ShopifyContextFetcher

  constructor(config: ShopifyConfig) {
    this.graphqlService = new ShopifyContextFetcher(config)
  }

  async resolveContextForZone(zoneName: string): Promise<ShopifyContext> {
    try {
      return await this.graphqlService.fetchShopifyContextByZoneName(zoneName)
    } catch (error) {
      throw new Error(`Failed to resolve context for zone ${zoneName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async fetchShopifyContextForZone(zoneId: string): Promise<ShopifyContext> {
    throw new Error('fetchShopifyContextForZone by ID is deprecated. Use fetchShopifyContextForZoneName instead.')
  }

  async fetchShopifyContextForZoneName(zoneName: string): Promise<ShopifyContext> {
    return this.graphqlService.fetchShopifyContextByZoneName(zoneName)
  }
}
