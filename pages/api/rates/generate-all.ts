import type { NextApiRequest, NextApiResponse } from 'next'
import { RateGeneratorService } from '../../../services/rate-generator'
import { GenerationResult } from '../../../types/rate-generation'

interface GenerateAllResponse {
  success: boolean
  message: string
  results: GenerationResult[]
  total_carriers: number
  successful_carriers: number
  failed_carriers: number
}

interface ErrorResponse {
  success: boolean
  message: string
  errors: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateAllResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      errors: ['Only POST method is supported']
    })
  }

  try {
    const generator = new RateGeneratorService()
    const results = await generator.generateRatesForAllCarriers()
    
    const successfulCarriers = results.filter(r => r.success).length
    const failedCarriers = results.filter(r => !r.success).length
    const totalZones = results.reduce((sum, r) => sum + r.zones_processed, 0)
    const totalRates = results.reduce((sum, r) => sum + r.rates_generated, 0)

    return res.status(200).json({
      success: true,
      message: `Generated rates for ${successfulCarriers}/${results.length} carriers (${totalRates} rates across ${totalZones} zones)`,
      results,
      total_carriers: results.length,
      successful_carriers: successfulCarriers,
      failed_carriers: failedCarriers
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate rates for all carriers',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    })
  }
}
