import { NextApiRequest, NextApiResponse } from 'next'
import { MultiZoneOrchestrator } from '../../../services/multi-zone-orchestrator-core'

interface DeployAllZonesResponse {
  success: boolean
  total_zones_processed: number
  successful_deployments: number
  failed_deployments: number
  results: Array<{
    zone_name: string
    zone_id: string
    success: boolean
    rates_deployed: number
    total_rates_generated: number
    message: string
    error?: string
    duration_ms?: number
    preview?: {
      rates: Array<{
        title: string
        price: number
        weightMin: number
        weightMax: number
      }>
      graphql?: {
        mutation: string
        variables: unknown
        ratesCount: number
      }
    }
  }>
  timestamp: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeployAllZonesResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      total_zones_processed: 0,
      successful_deployments: 0,
      failed_deployments: 0,
      results: [],
      timestamp: new Date().toISOString(),
      error: 'Only POST method supported'
    })
  }

  const timestamp = new Date().toISOString()
  const { dry_run = false } = req.body || {}

  try {
    const orchestrator = new MultiZoneOrchestrator()
    const result = await orchestrator.orchestrateAllZones(dry_run)

    return res.status(200).json({
      success: true,
      total_zones_processed: result.total_zones_processed,
      successful_deployments: result.successful_deployments,
      failed_deployments: result.failed_deployments,
      results: result.results,
      timestamp
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return res.status(500).json({
      success: false,
      total_zones_processed: 0,
      successful_deployments: 0,
      failed_deployments: 0,
      results: [],
      timestamp,
      error: errorMessage
    })
  }
}
