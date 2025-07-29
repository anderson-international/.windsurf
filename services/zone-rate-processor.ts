import type {
  BaseTariff,
  GeneratedRate, 
  CarrierInfo
} from '../types/rate-generation'
import { RateCalculator } from './rate-calculator'

export class ZoneRateProcessor {
  private readonly calculator: RateCalculator

  constructor() {
    this.calculator = new RateCalculator()
  }

  generateRatesForZone(
    tariffs: BaseTariff[], 
    carrierInfo: CarrierInfo,
    carrierServiceId: number,
    _zoneName: string
  ): GeneratedRate[] {
    const rates: GeneratedRate[] = []
    
    let previousParcelMaxRate = 0
    const weightCalculator = this.calculator.getWeightCalculator()
    
    const maxParcels = Math.ceil(carrierInfo.max_total_weight / carrierInfo.max_parcel_weight)
    
    for (let parcel = 1; parcel <= maxParcels; parcel++) {
      const parcelRanges = weightCalculator.generateParcelRanges(parcel, carrierInfo.max_parcel_weight)
      let currentParcelMaxRate = 0
      
      parcelRanges.forEach(range => {
        const tariff = this.calculator.calculateRate(
          tariffs,
          range,
          parcel,
          previousParcelMaxRate,
          carrierInfo.max_parcel_weight
        )
        
        const calculatedPrice = this.calculator.applyMarginToTariff(
          tariff,
          carrierInfo.margin_percentage
        )
        
        rates.push({
          weight_min: range.min,
          weight_max: range.max,
          tariff: tariff,
          calculated_price: calculatedPrice,
          rate_title: carrierInfo.service_name,
          delivery_description: carrierInfo.delivery_description,
          carrier_id: carrierServiceId
        })
        
        currentParcelMaxRate = Math.max(currentParcelMaxRate, tariff)
      })
      
      previousParcelMaxRate = currentParcelMaxRate
    }
    
    return rates
  }
}
