import type { WeightRange, BaseTariff } from '@/types/rate-generation'

export class WeightRangeCalculator {
  /**
   * Generate base weight ranges from carrier-specific tariff data
   * Derives continuous ranges from tariff max weights
   */
  generateBaseWeightRangesFromTariffs(tariffs: BaseTariff[]): WeightRange[] {
    if (tariffs.length === 0) {
      throw new Error('Cannot generate weight ranges: No tariffs provided')
    }

    // Sort tariffs by weight_kg ascending to ensure proper range derivation
    const sortedTariffs = [...tariffs].sort((a, b) => 
      parseFloat(a.weight_kg.toString()) - parseFloat(b.weight_kg.toString())
    )

    const ranges: WeightRange[] = []
    
    for (let i = 0; i < sortedTariffs.length; i++) {
      const currentWeight = parseFloat(sortedTariffs[i].weight_kg.toString())
      const previousWeight = i === 0 ? 0 : parseFloat(sortedTariffs[i - 1].weight_kg.toString())
      
      ranges.push({
        min: Math.round(previousWeight * 100) / 100,
        max: Math.round(currentWeight * 100) / 100
      })
    }
    
    return ranges
  }

  /**
   * @deprecated Use generateBaseWeightRangesFromTariffs instead
   * Legacy hardcoded ranges - kept for backward compatibility
   */
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

  /**
   * Generate parcel-specific weight ranges using tariff-derived base ranges
   */
  generateParcelRangesFromTariffs(
    tariffs: BaseTariff[], 
    parcelNumber: number, 
    maxParcelWeight: number
  ): WeightRange[] {
    const baseRanges = this.generateBaseWeightRangesFromTariffs(tariffs)
    const ranges: WeightRange[] = []
    
    const previousParcelMax = (parcelNumber - 1) * maxParcelWeight
    
    baseRanges.forEach(range => {
      const adjustedMin = previousParcelMax + range.min
      const adjustedMax = previousParcelMax + range.max
      if (adjustedMax <= previousParcelMax + maxParcelWeight) {
        ranges.push({
          min: Math.round(adjustedMin * 100) / 100,
          max: Math.round(adjustedMax * 100) / 100
        })
      }
    })

    return ranges
  }

  /**
   * @deprecated Use generateParcelRangesFromTariffs instead
   * Legacy method using hardcoded ranges
   */
  generateParcelRanges(parcelNumber: number, maxParcelWeight: number): WeightRange[] {
    const baseRanges = this.generateBaseWeightRanges()
    const ranges: WeightRange[] = []
    
    const previousParcelMax = (parcelNumber - 1) * maxParcelWeight
    
    baseRanges.forEach(range => {
      const adjustedMin = previousParcelMax + range.min
      const adjustedMax = previousParcelMax + range.max
      if (adjustedMax <= previousParcelMax + maxParcelWeight) {
        ranges.push({
          min: Math.round(adjustedMin * 100) / 100,
          max: Math.round(adjustedMax * 100) / 100
        })
      }
    })

    return ranges
  }
}
