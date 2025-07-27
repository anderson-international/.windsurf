import type { GeneratedRate } from '@/types/rate-generation'
import { DatabaseClient } from './database-client'

export class RateRepository {
  private readonly db: DatabaseClient
  constructor() {
    this.db = new DatabaseClient()
  }

  async connect(): Promise<void> {
    await this.db.connect()
  }

  async disconnect(): Promise<void> {
    await this.db.disconnect()
  }

  async fetchCarriers(): Promise<{ id: number; name: string }[]> {
    const prisma = this.db.getClient()
    return await prisma.carriers.findMany({
      select: { id: true, name: true }
    })
  }

  async storeGeneratedRates(rates: GeneratedRate[]): Promise<void> {
    const prisma = this.db.getClient()
    
    await prisma.generated_rates.deleteMany()
    
    const batchSize = 100
    
    for (let i = 0; i < rates.length; i += batchSize) {
      const batch = rates.slice(i, i + batchSize)
      
      await prisma.generated_rates.createMany({
        data: batch.map(rate => ({
          zone_name: rate.zone_name,
          weight_min: rate.weight_min,
          weight_max: rate.weight_max,
          tariff: rate.tariff,
          calculated_price: rate.calculated_price,
          carrier_id: 1
        }))
      })
    }
  }
}
