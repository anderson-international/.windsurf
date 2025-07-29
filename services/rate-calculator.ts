import type { BaseTariff, WeightRange } from '../types/rate-generation'
import { WeightRangeCalculator } from './weight-calculator'

export class RateCalculator {
  private readonly weightCalculator: WeightRangeCalculator

  constructor() {
    this.weightCalculator = new WeightRangeCalculator()
  }

  private findTariffForWeight(tariffs: BaseTariff[], weight: number): number {
    const tariff = tariffs.find(t => parseFloat(t.weight_kg.toString()) >= weight)
    
    if (!tariff) {
      throw new Error(
        `No tariff found for weight ${weight}kg. Available tariffs: ${tariffs.map(t => `${t.weight_kg}kg`).join(', ')}. ` +
        `This indicates a bug in the rate generation logic - tariff lookups should never exceed max parcel weight.`
      )
    }
    
    return parseFloat(tariff.tariff_amount.toString())
  }

  private calculateRateForRange(
    tariffs: BaseTariff[], 
    range: WeightRange, 
    parcelNumber: number,
    previousParcelMaxRate: number,
    maxParcelWeight: number
  ): number {
    if (parcelNumber === 1) {
      const baseTariff = this.findTariffForWeight(tariffs, range.max)
      return baseTariff
    } else {
      const remainderWeight = range.max - (parcelNumber - 1) * maxParcelWeight
      
      if (remainderWeight <= 0) {
        throw new Error(
          `Invalid remainder weight ${remainderWeight}kg for parcel ${parcelNumber}, range ${range.min}-${range.max}kg. ` +
          `Check parcel weight boundary calculations.`
        )
      }
      
      const baseTariff = this.findTariffForWeight(tariffs, remainderWeight)
      return Math.round((previousParcelMaxRate + baseTariff) * 100) / 100
    }
  }

  calculateRate(
    tariffs: BaseTariff[], 
    range: WeightRange, 
    parcelNumber: number,
    previousMaxRate: number,
    maxParcelWeight: number
  ): number {
    return this.calculateRateForRange(tariffs, range, parcelNumber, previousMaxRate, maxParcelWeight)
  }
  
  getWeightCalculator(): WeightRangeCalculator {
    return this.weightCalculator
  }

  applyMarginToTariff(tariff: number, marginPercentage: number): number {
    return Math.round((tariff * (1 + marginPercentage / 100)) * 100) / 100
  }
}
