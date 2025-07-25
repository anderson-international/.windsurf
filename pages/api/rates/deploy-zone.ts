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
  zone_name?: string
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

    // Initialize services
    const contextResolver = new ShopifyContextResolver(shopifyConfig)
    const rateDeployer = new ShopifyRateDeployer(shopifyConfig)

    // Resolve context for this zone using the working resolver
    const shopifyContext = await contextResolver.fetchShopifyContextForZone(zone_id)
    
    // Get zone name from the context (now included in the working GraphQL query)
    const zoneName = shopifyContext.zoneName

    // Fetch rates for the specific zone from database using zone_name
    const rates = await prisma.generated_rates.findMany({
      where: {
        zone_name: zoneName
      }
    })

    if (rates.length === 0) {
      return res.status(404).json({
        error: `No rates found for zone name "${zoneName}" (zone_id: ${zone_id})`,
        timestamp
      })
    }
    
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
      zone_name: zoneName,
      deployed_rates: rates.length,
      total_rates: rates.length,
      existing_method_definitions: shopifyContext.existingMethodDefinitionIds.length
    }

    return res.status(200).json({
      data: result,
      timestamp
    })

  } catch (error) {
    // Compose detailed error information for debugging
    let errorMessage: string
    let errorType: string
    let errorStack: string | undefined

    if (error instanceof Error) {
      errorMessage = error.message
      errorType = error.constructor.name
      errorStack = error.stack
    } else if (typeof error === 'string') {
      errorMessage = error
      errorType = 'StringError'
      errorStack = undefined
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error)
      errorType = 'ObjectError'
      errorStack = undefined
    } else {
      errorMessage = String(error)
      errorType = 'UnknownError'
      errorStack = undefined
    }

    // Compose comprehensive error message
    const detailedError = [
      `${errorType}: ${errorMessage}`,
      errorStack ? `Stack: ${errorStack.split('\n')[0]}` : null,
      `Zone: ${req.body?.zone_id || 'undefined'}`,
      `Timestamp: ${timestamp}`
    ].filter(Boolean).join(' | ')
    
    return res.status(500).json({
      error: detailedError,
      timestamp
    })
  } finally {
    await prisma.$disconnect()
  }
}
