import { ShopifyContextResolver } from './shopify-context-resolver-core'
import { ShopifyRateDeployer } from './shopify-rate-deployer-core'
import { ZoneRateCollector } from './zone-rate-collector'
import { ShopifyConfig } from './shopify-config'
import { resolveShopifyTarget } from './shopify-target-resolver'
import { ZoneRateResponse } from '../types/zone-rate-types'
import type { GeneratedRate } from '../types/rate-generation'

export class ZoneRateGenerationService {
  private readonly collector: ZoneRateCollector
  private readonly shopifyConfig: ShopifyConfig

  constructor() {
    this.collector = new ZoneRateCollector()
    const resolved = resolveShopifyTarget()
    this.shopifyConfig = resolved.config
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

      const response: ZoneRateResponse = {
        success: true,
        zone_name: zoneName,
        rates_deployed: deploymentResult.rates_deployed,
        total_rates_generated: ratesToDeploy.length,
        message: `Successfully deployed ${deploymentResult.rates_deployed} rates to Shopify`
      }

      if (dryRun) {
        response.preview = {
          rates: ratesToDeploy.map(r => ({
            title: r.rate_title,
            price: Number(r.calculated_price),
            weightMin: Number(r.weight_min),
            weightMax: Number(r.weight_max)
          }))
        }
        if (deploymentResult.preview?.graphql) {
          response.preview.graphql = deploymentResult.preview.graphql
        }
      }

      return response

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Zone rate generation failed for ${zoneName}: ${errorMessage}`)
    }
  }

  private async deployRatesToShopify(
    zoneName: string, 
    rates: GeneratedRate[],
    dryRun: boolean = false
  ): Promise<{ rates_deployed: number, preview?: { graphql?: { mutation: string; variables: unknown; ratesCount: number } } }> {
    const contextResolver = new ShopifyContextResolver(this.shopifyConfig)
    const rateDeployer = new ShopifyRateDeployer(this.shopifyConfig)

    const shopifyContext = await contextResolver.fetchShopifyContextForZoneName(zoneName)
    const result = await rateDeployer.deployZoneRates(shopifyContext.zoneId, rates, shopifyContext, dryRun)

    const preview = dryRun && result && 'graphqlPreview' in result ? { graphql: result.graphqlPreview } : undefined

    return { rates_deployed: rates.length, preview }
  }
}
