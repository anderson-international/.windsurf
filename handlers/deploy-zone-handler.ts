import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { ShopifyContextResolver } from '../services/shopify-context-resolver-core'
import { ShopifyConfig } from '../services/shopify-config'
import { ShopifyRateDeployer } from '../services/shopify-rate-deployer-core'
import { DeployZoneValidator } from '../validation/deploy-zone-validation'
import { DeployZoneErrorHandler, ApiResponse } from '../error/deploy-zone-error-handler'

interface SingleZoneDeploymentResult {
  success: boolean
  zone_id: string
  zone_name?: string
  deployed_rates: number
  total_rates: number
  existing_method_definitions: number
  error?: string
}

export class DeployZoneHandler {
  private prisma: PrismaClient
  private validator: DeployZoneValidator
  private shopifyConfig: ShopifyConfig

  constructor() {
    this.prisma = new PrismaClient()
    this.validator = new DeployZoneValidator(this.prisma)
    this.shopifyConfig = {
      storeUrl: process.env.SHOPIFY_STORE_URL!,
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }
  }

  async handleRequest(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleZoneDeploymentResult>>): Promise<void> {
    const timestamp = new Date().toISOString()

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        timestamp
      })
    }

    try {
      const validation = this.validator.validateRequest(req)
      if (!validation.success) {
        return res.status(400).json({
          error: validation.error!,
          timestamp
        })
      }

      const contextResolver = new ShopifyContextResolver(this.shopifyConfig)
      const rateDeployer = new ShopifyRateDeployer(this.shopifyConfig)

      const shopifyContext = await contextResolver.fetchShopifyContextForZone(validation.zone_id!)
      const zoneName = shopifyContext.zoneName

      const rateData = await this.validator.fetchAndConvertRates(zoneName, validation.zone_id!)
      if (!rateData.success) {
        return res.status(404).json({
          error: rateData.error!,
          timestamp
        })
      }

      await rateDeployer.deployZoneRates(validation.zone_id!, rateData.data!.convertedRates, shopifyContext)

      const result: SingleZoneDeploymentResult = {
        success: true,
        zone_id: validation.zone_id!,
        zone_name: zoneName,
        deployed_rates: rateData.data!.convertedRates.length,
        total_rates: rateData.data!.convertedRates.length,
        existing_method_definitions: shopifyContext.existingMethodDefinitionIds.length
      }

      return res.status(200).json({
        data: result,
        timestamp
      })

    } catch (error) {
      const detailedError = DeployZoneErrorHandler.formatError(error, req, timestamp)
      
      return res.status(500).json({
        error: detailedError,
        timestamp
      })
    } finally {
      await this.prisma.$disconnect()
    }
  }
}
