import type { NextApiRequest, NextApiResponse } from 'next'
import { RateGeneratorService } from '../../../../services/rate-generator'
import { GenerationResult } from '../../../../types/rate-generation'

interface ErrorResponse {
  success: boolean
  message: string
  errors: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerationResult | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      errors: ['Only POST method is supported']
    })
  }

  const { carrierId } = req.query

  if (!carrierId || Array.isArray(carrierId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid carrier ID',
      errors: ['Carrier ID must be provided as a single value in the URL path']
    })
  }

  const parsedCarrierId = parseInt(carrierId, 10)
  if (isNaN(parsedCarrierId) || parsedCarrierId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid carrier ID',
      errors: ['Carrier ID must be a positive integer']
    })
  }

  try {
    const generator = new RateGeneratorService()
    const result = await generator.generateRates(parsedCarrierId)
    
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to generate rates for carrier ${parsedCarrierId}`,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    })
  }
}
