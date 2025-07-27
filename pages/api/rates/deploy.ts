import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyConfig } from '../../../services/shopify-config'
import { RateDeploymentService } from '../../../services/rate-deployment-service'
import { DeploymentSummary } from '../../../types/deployment-summary'

interface ApiResponse<T> {
  data?: T
  error?: string
  timestamp: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<DeploymentSummary>>): Promise<void> {
  const timestamp = new Date().toISOString()

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp
    })
  }

  let deploymentService: RateDeploymentService | undefined

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

    deploymentService = new RateDeploymentService(shopifyConfig)

    const transformedRates = await deploymentService.fetchGeneratedRates()
    
    if (transformedRates.length === 0) {
      return res.status(400).json({
        error: 'No generated rates found. Please generate rates first.',
        timestamp
      })
    }

    const matchingResult = await deploymentService.performZoneMatching(transformedRates)
    
    if (matchingResult.matches.length === 0) {
      return res.status(400).json({
        error: 'No zones matched between Shopify and database. Check zone names for consistency.',
        timestamp
      })
    }

    const deploymentResults = await deploymentService.deployRates(matchingResult)
    const statusCode = deploymentResults.success ? 200 : (deploymentResults.zones_deployed > 0 ? 207 : 500)

    return res.status(statusCode).json({
      data: deploymentResults,
      timestamp
    })

  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown deployment error',
      timestamp
    })
  } finally {
    if (deploymentService) {
      await deploymentService.disconnect()
    }
  }
}
