import { PrismaClient } from '@prisma/client'
import { GeneratedRate } from '../types/rate-generation'

export class RateDeploymentRepository {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async fetchGeneratedRates(): Promise<GeneratedRate[]> {
    const generatedRates = await this.prisma.generated_rates.findMany({
      select: {
        zone_name: true,
        weight_min: true,
        weight_max: true,
        tariff: true,
        calculated_price: true,
        carriers: {
          select: {
            rate_title: true,
            delivery_description: true
          }
        }
      }
    })

    return generatedRates.map(rate => ({
      zone_id: rate.zone_name,
      zone_name: rate.zone_name,
      weight_min: Number(rate.weight_min),
      weight_max: Number(rate.weight_max),
      tariff: Number(rate.tariff),
      calculated_price: Number(rate.calculated_price),
      rate_title: rate.carriers.rate_title,
      delivery_description: rate.carriers.delivery_description
    }))
  }
}
