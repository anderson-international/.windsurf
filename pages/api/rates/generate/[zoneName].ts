import { NextApiRequest, NextApiResponse } from 'next'
import { ZoneRateGenerationService } from '../../../../services/zone-rate-service'

interface ZoneRateResponse {
  success: boolean
  zone_name: string
  rates_deployed: number
  total_rates_generated: number
  message: string
  error?: string
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
    const result = await service.generateAndDeployZoneRates(zoneName)
    
    return res.status(200).json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return res.status(500).json({
      success: false,
      zone_name: zoneName,
      rates_deployed: 0,
      total_rates_generated: 0,
      message: 'Internal server error',
      error: errorMessage
    })
  }
}
