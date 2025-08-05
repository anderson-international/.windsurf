import { ShopifyContextResolver } from './shopify-context-resolver-core'
import { ShopifyRateDeployer } from './shopify-rate-deployer-core'
import { ZoneRateCollector } from './zone-rate-collector'
import { ShopifyConfig } from './shopify-config'
import { ZoneRateResponse } from '../types/zone-rate-types'
import type { GeneratedRate } from '../types/rate-generation'

export class ZoneRateGenerationService {
  private readonly collector: ZoneRateCollector
  private readonly shopifyConfig: ShopifyConfig

  constructor() {
    this.collector = new ZoneRateCollector()
    this.shopifyConfig = {
      storeUrl: process.env.SHOPIFY_STORE_URL!,
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }
  }

  async generateAndDeployZoneRates(zoneName: string, dryRun: boolean = false): Promise<ZoneRateResponse> {
    try {
      const ratesToDeploy = await this.collector.buildInMemoryRatesCollection(zoneName)

      if (ratesToDeploy.length === 0) {
        return {
          success: true,
          zone_name: zoneName,
          rates_deployed: 0,
          total_rates_generated: 0,
          message: 'No rates available for zone - skipped deployment'
        }
      }

      const deploymentResult = await this.deployRatesToShopify(zoneName, ratesToDeploy, dryRun)
      
      return {
        success: true,
        zone_name: zoneName,
        rates_deployed: deploymentResult.rates_deployed,
        total_rates_generated: ratesToDeploy.length,
        message: `Successfully deployed ${deploymentResult.rates_deployed} rates to Shopify`
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Zone rate generation failed for ${zoneName}: ${errorMessage}`)
    }
  }

  private async deployRatesToShopify(
    zoneName: string, 
    rates: GeneratedRate[],
    dryRun: boolean = false
  ): Promise<{ rates_deployed: number }> {
    const contextResolver = new ShopifyContextResolver(this.shopifyConfig)
    const rateDeployer = new ShopifyRateDeployer(this.shopifyConfig)

    const shopifyContext = await contextResolver.fetchShopifyContextForZoneName(zoneName)
    await rateDeployer.deployZoneRates(shopifyContext.zoneId, rates, shopifyContext, dryRun)

    return { rates_deployed: rates.length }
  }
}
