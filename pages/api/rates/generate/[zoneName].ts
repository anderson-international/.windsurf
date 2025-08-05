import { NextApiRequest, NextApiResponse } from 'next'
import { ZoneRateGenerationService } from '../../../../services/zone-rate-service'

interface ZoneRateResponse {
  success: boolean
  zone_name: string
  rates_deployed: number
  total_rates_generated: number
  message: string
  error?: string
  error_details?: {
    error_type: string
    original_message: string
    zone_context: string
    dry_run_mode: boolean
    stack_trace?: string[]
  }
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ZoneRateResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      zone_name: '',
      rates_deployed: 0,
      total_rates_generated: 0,
      message: 'Method not allowed',
      error: 'Only POST method supported'
    })
  }

  const zoneName = req.query.zoneName as string
  const { dry_run = false } = req.body || {}
  
  if (!zoneName) {
    return res.status(400).json({
      success: false,
      zone_name: '',
      rates_deployed: 0,
      total_rates_generated: 0,
      message: 'Zone name required',
      error: 'Zone name parameter is missing'
    })
  }

  try {
    const service = new ZoneRateGenerationService()
    const result = await service.generateAndDeployZoneRates(zoneName, dry_run)
    
    return res.status(200).json(result)
  } catch (error) {
    // Enhanced error handling with detailed diagnostic information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    
    // Log detailed error information for debugging
    console.error(`❌ Zone generation failed for '${zoneName}':`, {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      zoneName,
      dryRun: dry_run
    })
    
    return res.status(500).json({
      success: false,
      zone_name: zoneName,
      rates_deployed: 0,
      total_rates_generated: 0,
      message: 'Zone rate generation failed',
      error: `${errorName}: ${errorMessage}`,
      error_details: {
        error_type: errorName,
        original_message: errorMessage,
        zone_context: zoneName,
        dry_run_mode: dry_run,
        stack_trace: errorStack?.split('\n').slice(0, 5) // First 5 lines of stack trace
      }
    })
  }
}
