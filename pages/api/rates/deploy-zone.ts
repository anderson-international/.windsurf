import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { ShopifyContextResolver } from '../../../services/shopify-context-resolver-core'
import { ShopifyConfig } from '../../../services/shopify-config'
import { ShopifyRateDeployer } from '../../../services/shopify-rate-deployer-core'
import { GeneratedRate } from '../../../types/rate-generation'

const prisma = new PrismaClient()

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  timestamp: string
}

interface SingleZoneDeploymentResult {
  success: boolean
  zone_id: string
  deployed_rates: number
  total_rates: number
  existing_method_definitions: number
  error?: string
}

/**
 * POST /api/rates/deploy-zone
 * Deploy rates for a single zone to test duplicate prevention fix
 * 
 * Body: { zone_id: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleZoneDeploymentResult>>): Promise<void> {
  const timestamp = new Date().toISOString()

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp
    })
  }

  try {
    const { zone_id } = req.body

    if (!zone_id || typeof zone_id !== 'string') {
      return res.status(400).json({
        error: 'zone_id is required and must be a string',
        timestamp
      })
    }

    const shopifyConfig: ShopifyConfig = {
      storeUrl: process.env.SHOPIFY_STORE_URL!,
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }

    // Fetch rates for the specific zone from database
    const rates = await prisma.generated_rates.findMany({
      where: {
        zone_id: zone_id
      }
    })

    if (rates.length === 0) {
      return res.status(404).json({
        error: `No rates found for zone ${zone_id}`,
        timestamp
      })
    }

    // Initialize services
    const contextResolver = new ShopifyContextResolver(shopifyConfig)
    const rateDeployer = new ShopifyRateDeployer(shopifyConfig)

    // Resolve context for this single zone (should avoid throttling)
    const shopifyContext = await contextResolver.fetchShopifyContextForZone(zone_id)
    
    // Convert Prisma results to GeneratedRate format
    const convertedRates: GeneratedRate[] = rates.map(rate => ({
      zone_id: rate.zone_id,
      zone_name: rate.zone_name,
      weight_min: Number(rate.weight_min),
      weight_max: Number(rate.weight_max),
      calculated_price: Number(rate.calculated_price),
      tariff: rate.tariff ? Number(rate.tariff) : 0,
      rate_title: rate.rate_title,
      delivery_description: rate.delivery_description
    }))
    
    // Deploy rates for this zone
    await rateDeployer.deployZoneRates(zone_id, convertedRates, shopifyContext)

    const result: SingleZoneDeploymentResult = {
      success: true,
      zone_id: zone_id,
      deployed_rates: rates.length,
      total_rates: rates.length,
      existing_method_definitions: shopifyContext.existingMethodDefinitionIds.length
    }

    return res.status(200).json({
      data: result,
      timestamp
    })

  } catch (error) {
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error'
    
    return res.status(500).json({
      error: errorMessage,
      timestamp
    })
  } finally {
    await prisma.$disconnect()
  }
}
