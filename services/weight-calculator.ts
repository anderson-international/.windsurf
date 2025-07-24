import type { WeightRange, RateGenerationConfig } from '@/types/rate-generation'

export class WeightRangeCalculator {
  private readonly config: RateGenerationConfig

  constructor(config: RateGenerationConfig) {
    this.config = config
  }

  generateBaseWeightRanges(): WeightRange[] {
    const ranges: WeightRange[] = []
    for (let weight = 0.05; weight <= 0.50; weight += 0.05) {
      ranges.push({
        min: Math.round((weight - 0.05) * 100) / 100,
        max: Math.round(weight * 100) / 100
      })
    }
    for (let weight = 0.60; weight <= 2.10; weight += 0.10) {
      ranges.push({
        min: Math.round((weight - 0.10) * 100) / 100,
        max: Math.round(weight * 100) / 100
      })
    }
    
    return ranges
  }

  generateParcelRanges(parcelNumber: number): WeightRange[] {
    const baseRanges = this.generateBaseWeightRanges()
    const ranges: WeightRange[] = []
    
    const previousParcelMax = (parcelNumber - 1) * this.config.MAX_PARCEL_WEIGHT
    
    baseRanges.forEach(range => {
      const adjustedMin = previousParcelMax + range.min
      const adjustedMax = previousParcelMax + range.max
      if (adjustedMax <= this.config.MAX_TOTAL_WEIGHT) {
        ranges.push({
          min: Math.round(adjustedMin * 100) / 100,
          max: Math.round(adjustedMax * 100) / 100
        })
      }
    })
    
    return ranges
  }
}
