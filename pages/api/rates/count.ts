import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseClient } from '@/services/database-client'

export interface RateCountResponse {
  generated_rates: number
  timestamp: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RateCountResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      generated_rates: 0,
      timestamp: new Date().toISOString()
    })
  }

  const db = new DatabaseClient()

  try {
    await db.connect()
    const prisma = db.getClient()
    
    const count = await prisma.generated_rates.count()
    
    await db.disconnect()

    return res.status(200).json({
      generated_rates: count,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    await db.disconnect()
    
    return res.status(500).json({
      generated_rates: 0,
      timestamp: new Date().toISOString()
    })
  }
}
