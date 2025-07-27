import { NextApiRequest } from 'next'
import { PrismaClient } from '@prisma/client'
import { GeneratedRate } from '../types/rate-generation'

interface ValidationResult {
  success: boolean
  error?: string
  data?: {
    zone_id: string
    zoneName: string
    convertedRates: GeneratedRate[]
  }
}

export class DeployZoneValidator {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  validateRequest(req: NextApiRequest): { success: boolean; error?: string; zone_id?: string } {
    const { zone_id } = req.body

    if (!zone_id || typeof zone_id !== 'string') {
      return {
        success: false,
        error: 'zone_id is required and must be a string'
      }
    }

    return {
      success: true,
      zone_id
    }
  }

  async fetchAndConvertRates(zoneName: string, zone_id: string): Promise<ValidationResult> {
    const rates = await this.prisma.generated_rates.findMany({
      where: {
        zone_name: zoneName
      },
      include: {
        carriers: {
          select: {
            rate_title: true,
            delivery_description: true
          }
        }
      }
    })

    if (rates.length === 0) {
      return {
        success: false,
        error: `No rates found for zone name "${zoneName}" (zone_id: ${zone_id})`
      }
    }

    const convertedRates: GeneratedRate[] = rates.map(rate => ({
      zone_id: rate.zone_name,
      zone_name: rate.zone_name,
      weight_min: Number(rate.weight_min),
      weight_max: Number(rate.weight_max),
      calculated_price: Number(rate.calculated_price),
      tariff: rate.tariff ? Number(rate.tariff) : 0,
      rate_title: rate.carriers.rate_title,
      delivery_description: rate.carriers.delivery_description
    }))

    return {
      success: true,
      data: {
        zone_id,
        zoneName,
        convertedRates
      }
    }
  }
}
