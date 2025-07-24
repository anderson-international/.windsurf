import type { ZoneTariff, WeightRange, RateGenerationConfig } from '@/types/rate-generation'
import { WeightRangeCalculator } from './weight-calculator'

export class RateCalculator {
  private readonly config: RateGenerationConfig
  private readonly weightCalculator: WeightRangeCalculator

  constructor(config: RateGenerationConfig) {
    this.config = config
    this.weightCalculator = new WeightRangeCalculator(config)
  }

  private findTariffForWeight(tariffs: ZoneTariff[], weight: number): number {
    const tariff = tariffs.find(t => t.weight_kg >= weight)
    
    if (!tariff) {
      return tariffs[tariffs.length - 1].tariff_amount
    }
    
    return tariff.tariff_amount
  }

  private calculateRateForRange(
    tariffs: ZoneTariff[], 
    range: WeightRange, 
    parcelNumber: number,
    previousParcelMaxRate: number
  ): number {
    const baseTariff = this.findTariffForWeight(tariffs, range.max)
    
    if (parcelNumber === 1) {
      return baseTariff
    } else {
      return Math.round((previousParcelMaxRate + baseTariff) * 100) / 100
    }
  }

  calculateRate(
    tariffs: ZoneTariff[], 
    range: WeightRange, 
    parcelNumber: number,
    previousMaxRate: number
  ): number {
    return this.calculateRateForRange(tariffs, range, parcelNumber, previousMaxRate)
  }
  
  getWeightCalculator(): WeightRangeCalculator {
    return this.weightCalculator
  }
}
