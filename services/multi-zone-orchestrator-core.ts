import { ShopifyZoneFetcher } from './shopify-zone-fetcher'
import { ZoneProcessor } from './zone-processor'
import { ShopifyConfig } from './shopify-config'
import { ShopifyZone, ZoneProcessingResult, OrchestrationResult } from '../types/multi-zone-types'

export class MultiZoneOrchestrator {
  private readonly shopifyConfig: ShopifyConfig
  private readonly zoneProcessor: ZoneProcessor

  constructor() {
    this.shopifyConfig = {
      storeUrl: process.env.SHOPIFY_STORE_URL!,
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    this.zoneProcessor = new ZoneProcessor(baseUrl)
  }

  async orchestrateAllZones(): Promise<OrchestrationResult> {
    try {
      const zones = await this.fetchShopifyZones()
      
      if (zones.length === 0) {
        return {
          total_zones_processed: 0,
          successful_deployments: 0,
          failed_deployments: 0,
          results: []
        }
      }

      const results = await this.zoneProcessor.processAllZones(zones)
      return this.compileResults(results)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Multi-zone orchestration failed: ${errorMessage}`)
    }
  }

  private async fetchShopifyZones(): Promise<ShopifyZone[]> {
    const zoneFetcher = new ShopifyZoneFetcher(this.shopifyConfig)
    return await zoneFetcher.fetchAllZones()
  }

  private compileResults(results: ZoneProcessingResult[]): OrchestrationResult {
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return {
      total_zones_processed: results.length,
      successful_deployments: successful,
      failed_deployments: failed,
      results
    }
  }
}
