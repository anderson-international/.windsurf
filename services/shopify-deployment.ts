import { GeneratedRate } from '../types/rate-generation'
import { RateTransformer } from './rate-transformer'
import { ShopifyContextResolver } from './shopify-context-resolver-core'
import { ShopifyConfig } from './shopify-config'
import { ShopifyRateDeployer } from './shopify-rate-deployer-core'

export interface DeploymentResult {
  success: boolean
  deployed_rates: number
  readonly failed_zones: string[]
  readonly errors: string[]
}

export class ShopifyDeploymentService {
  private readonly transformer: RateTransformer
  private readonly contextResolver: ShopifyContextResolver
  private readonly rateDeployer: ShopifyRateDeployer

  constructor(config: ShopifyConfig) {
    this.transformer = new RateTransformer()
    this.contextResolver = new ShopifyContextResolver(config)
    this.rateDeployer = new ShopifyRateDeployer(config)
  }

  async deployRates(rates: GeneratedRate[]): Promise<DeploymentResult> {
    const result: DeploymentResult = {
      success: false,
      deployed_rates: 0,
      failed_zones: [],
      errors: []
    }

    try {
      const contextMap = await this.contextResolver.resolveContextsForRates(rates)
      const groupedRates = this.transformer.groupRatesByZone(rates)
      
      for (const [zoneId, zoneRates] of groupedRates) {
        try {
          await this.rateDeployer.deployZoneRates(zoneId, zoneRates, contextMap[zoneId])
          result.deployed_rates += zoneRates.length
        } catch (error) {
          result.failed_zones.push(zoneId)
          result.errors.push(`Zone ${zoneId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      result.success = result.failed_zones.length === 0
      return result

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown deployment error')
      return result
    }
  }
}
