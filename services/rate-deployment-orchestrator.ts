import { ShopifyConfig } from './shopify-config'
import { ShopifyContextResolver } from './shopify-context-resolver-core'
import { ShopifyRateDeployer } from './shopify-rate-deployer-core'
import { RateTransformer } from './rate-transformer'
import { ZoneMatchingResult, ShopifyZone, DatabaseZone } from './zone-matcher-types'
import { DeploymentSummary } from '../types/deployment-summary'

export class RateDeploymentOrchestrator {
  private readonly config: ShopifyConfig
  private readonly contextResolver: ShopifyContextResolver
  private readonly rateDeployer: ShopifyRateDeployer
  private readonly rateTransformer: RateTransformer

  constructor(config: ShopifyConfig) {
    this.config = config
    this.contextResolver = new ShopifyContextResolver(config)
    this.rateDeployer = new ShopifyRateDeployer(config)
    this.rateTransformer = new RateTransformer()
  }

  async deployRates(matchingResult: ZoneMatchingResult): Promise<DeploymentSummary> {
    const deploymentResults: DeploymentSummary = {
      success: false,
      zones_matched: matchingResult.matches.length,
      zones_deployed: 0,
      zones_failed: 0,
      total_rates_deployed: 0,
      shopify_only_zones: matchingResult.shopify_only_zones.map((z: ShopifyZone) => z.name),
      database_only_zones: matchingResult.database_only_zones.map((z: DatabaseZone) => z.zone_name),
      failed_zones: [],
      errors: []
    }

    for (const match of matchingResult.matches) {
      try {
        const shopifyContext = await this.contextResolver.fetchShopifyContextForZone(match.shopify_zone.id)
        
        const shopifyRateInputs = this.rateTransformer.transformRatesForZone(
          match.generated_rates,
          match.shopify_zone.id,
          match.shopify_zone.name
        )

        await this.rateDeployer.updateProfileWithRates(
          shopifyContext.profileId,
          shopifyContext.locationGroupId,
          match.shopify_zone.id,
          shopifyRateInputs,
          shopifyContext.existingMethodDefinitionIds
        )

        deploymentResults.zones_deployed++
        deploymentResults.total_rates_deployed += match.generated_rates.length
        
      } catch (error) {
        const errorMessage = `Failed to deploy zone ${match.shopify_zone.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        deploymentResults.zones_failed++
        deploymentResults.failed_zones.push(match.shopify_zone.name)
        deploymentResults.errors.push(errorMessage)
      }
    }

    deploymentResults.success = deploymentResults.zones_failed === 0
    return deploymentResults
  }
}
