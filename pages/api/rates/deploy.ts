import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { ShopifyConfig } from '../../../services/shopify-config'
import { ShopifyContextResolver } from '../../../services/shopify-context-resolver-core'
import { ZoneMatcher } from '../../../services/zone-matcher-core'
import { ShopifyRateDeployer } from '../../../services/shopify-rate-deployer-core'
import { RateTransformer } from '../../../services/rate-transformer'

const prisma = new PrismaClient()

interface ApiResponse<T> {
  data?: T
  error?: string
  timestamp: string
}

interface DeploymentSummary {
  success: boolean
  zones_matched: number
  zones_deployed: number
  zones_failed: number
  total_rates_deployed: number
  shopify_only_zones: string[]
  database_only_zones: string[]
  failed_zones: string[]
  errors: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<DeploymentSummary>>): Promise<void> {
  const timestamp = new Date().toISOString()

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp
    })
  }

  try {
    const shopifyConfig: ShopifyConfig = {
      storeUrl: process.env.SHOPIFY_STORE_URL!,
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
      apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01'
    }

    if (!shopifyConfig.storeUrl || !shopifyConfig.adminAccessToken) {
      return res.status(500).json({
        error: 'Missing Shopify configuration (SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN required)',
        timestamp
      })
    }

    // Step 1: Fetch all generated rates from database
    console.log('📊 Step 1: Fetching generated rates from database...')
    const generatedRates = await prisma.generated_rates.findMany({
      select: {
        zone_id: true,
        zone_name: true,
        weight_min: true,
        weight_max: true,
        tariff: true,
        calculated_price: true,
        rate_title: true,
        delivery_description: true
      }
    })

    if (generatedRates.length === 0) {
      return res.status(400).json({
        error: 'No generated rates found. Please generate rates first.',
        timestamp
      })
    }

    const transformedRates = generatedRates.map(rate => ({
      zone_id: rate.zone_id,
      zone_name: rate.zone_name,
      weight_min: Number(rate.weight_min),
      weight_max: Number(rate.weight_max),
      tariff: Number(rate.tariff),
      calculated_price: Number(rate.calculated_price),
      rate_title: rate.rate_title,
      delivery_description: rate.delivery_description
    }))

    // Step 2: Initialize services
    const zoneMatcher = new ZoneMatcher(shopifyConfig)
    const contextResolver = new ShopifyContextResolver(shopifyConfig)
    const rateDeployer = new ShopifyRateDeployer(shopifyConfig)
    const rateTransformer = new RateTransformer()

    // Step 3: Fetch zones from Shopify
    console.log('🏪 Step 2: Fetching zones from Shopify...')
    const shopifyZones = await zoneMatcher.fetchShopifyZones()
    console.log(`Found ${shopifyZones.length} zones in Shopify`)

    // Step 4: Extract zones from database
    console.log('💾 Step 3: Extracting zones from database...')
    const databaseZones = zoneMatcher.extractDatabaseZones(transformedRates)
    console.log(`Found ${databaseZones.length} zones in database`)

    // Step 5: Match zones by name
    console.log('🔗 Step 4: Matching zones by name...')
    const matchingResult = zoneMatcher.matchZones(shopifyZones, databaseZones, transformedRates)
    console.log(`Matched ${matchingResult.matches.length} zones for deployment`)

    if (matchingResult.matches.length === 0) {
      return res.status(400).json({
        error: 'No zones matched between Shopify and database. Check zone names for consistency.',
        timestamp
      })
    }

    // Step 6: Deploy rates for matched zones
    console.log('🚀 Step 5: Deploying rates for matched zones...')
    const deploymentResults: DeploymentSummary = {
      success: false,
      zones_matched: matchingResult.matches.length,
      zones_deployed: 0,
      zones_failed: 0,
      total_rates_deployed: 0,
      shopify_only_zones: matchingResult.shopify_only_zones.map(z => z.name),
      database_only_zones: matchingResult.database_only_zones.map(z => z.zone_name),
      failed_zones: [],
      errors: []
    }

    // Deploy each matched zone
    for (const match of matchingResult.matches) {
      try {
        console.log(`Deploying ${match.generated_rates.length} rates for zone: ${match.shopify_zone.name}`)
        
        // Get Shopify context for this zone
        const shopifyContext = await contextResolver.fetchShopifyContextForZone(match.shopify_zone.id)
        
        // Transform rates for this zone
        const shopifyRateInputs = rateTransformer.transformRatesForZone(
          match.generated_rates,
          match.shopify_zone.id,
          match.shopify_zone.name
        )

        // Deploy rates with atomic replacement
        await rateDeployer.updateProfileWithRates(
          shopifyContext.profileId,
          shopifyContext.locationGroupId,
          match.shopify_zone.id,
          shopifyRateInputs,
          shopifyContext.existingMethodDefinitionIds
        )

        deploymentResults.zones_deployed++
        deploymentResults.total_rates_deployed += match.generated_rates.length
        
      } catch (error) {
        console.error(`Failed to deploy zone ${match.shopify_zone.name}:`, error)
        deploymentResults.zones_failed++
        deploymentResults.failed_zones.push(match.shopify_zone.name)
        deploymentResults.errors.push(`Zone ${match.shopify_zone.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    deploymentResults.success = deploymentResults.zones_failed === 0

    const statusCode = deploymentResults.success ? 200 : (deploymentResults.zones_deployed > 0 ? 207 : 500)

    return res.status(statusCode).json({
      data: deploymentResults,
      timestamp
    })

  } catch (error) {
    console.error('Rate deployment error:', error)
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown deployment error',
      timestamp
    })
  } finally {
    await prisma.$disconnect()
  }
}
