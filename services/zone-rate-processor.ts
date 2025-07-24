import type { 
  GeneratedRate, 
  ZoneTariff, 
  CarrierInfo,
  RateGenerationConfig 
} from '@/types/rate-generation'
import { RateCalculator } from './rate-calculator'

export class ZoneRateProcessor {
  private readonly config: RateGenerationConfig
  private readonly calculator: RateCalculator

  constructor(config: RateGenerationConfig) {
    this.config = config
    this.calculator = new RateCalculator(config)
  }

  generateRatesForZone(
    zoneTariffs: ZoneTariff[], 
    carrierInfo: CarrierInfo
  ): GeneratedRate[] {
    const rates: GeneratedRate[] = []
    const zoneId = zoneTariffs[0].zone_id
    const zoneName = zoneTariffs[0].zone_name
    
    let previousParcelMaxRate = 0
    const weightCalculator = this.calculator.getWeightCalculator()
    
    for (let parcel = 1; parcel <= this.config.MAX_PARCELS; parcel++) {
      const parcelRanges = weightCalculator.generateParcelRanges(parcel)
      let currentParcelMaxRate = 0
      
      parcelRanges.forEach(range => {
        const tariff = this.calculator.calculateRate(
          zoneTariffs,
          range,
          parcel,
          previousParcelMaxRate
        )
        
        const calculatedPrice = this.calculator.applyMarginToTariff(
          tariff,
          carrierInfo.margin_percentage
        )
        
        rates.push({
          zone_id: zoneId,
          zone_name: zoneName,
          weight_min: range.min,
          weight_max: range.max,
          tariff: tariff,
          calculated_price: calculatedPrice,
          rate_title: carrierInfo.rate_title,
          delivery_description: carrierInfo.delivery_description
        })
        
        currentParcelMaxRate = Math.max(currentParcelMaxRate, tariff)
      })
      
      previousParcelMaxRate = currentParcelMaxRate
    }
    
    return rates
  }
}
