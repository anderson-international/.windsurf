import type { NextApiRequest, NextApiResponse } from 'next'
import { RateGeneratorService } from '@/services/rate-generator'

export interface RateGenerationResponse {
  success: boolean
  zones_processed: number
  rates_generated: number
  errors?: string[]
  execution_time_ms: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RateGenerationResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      zones_processed: 0,
      rates_generated: 0,
      errors: ['Method not allowed. Use POST.'],
      execution_time_ms: 0
    })
  }

  const startTime = Date.now()
  const generator = new RateGeneratorService()

  try {
    await generator.connect()
    
    const { carrierId } = req.body
    
    if (!carrierId || typeof carrierId !== 'number') {
      return res.status(400).json({
        success: false,
        zones_processed: 0,
        rates_generated: 0,
        errors: ['carrierId is required and must be a number'],
        execution_time_ms: Date.now() - startTime
      })
    }
    
    const result = await generator.generateRates(carrierId)
    
    const response: RateGenerationResponse = {
      success: result.success,
      zones_processed: result.zones_processed,
      rates_generated: result.rates_generated,
      errors: result.errors,
      execution_time_ms: Date.now() - startTime
    }

    await generator.disconnect()

    return res.status(200).json(response)

  } catch (error) {
    await generator.disconnect()
    
    return res.status(500).json({
      success: false,
      zones_processed: 0,
      rates_generated: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      execution_time_ms: Date.now() - startTime
    })
  }
}
