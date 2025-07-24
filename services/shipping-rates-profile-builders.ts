import { ShippingRate } from '../types/api'
import { DeliveryProfile } from '../types/shopify-core'
import { DeliveryProfileInput, DeliveryProfileLocationGroupInput, DeliveryLocationGroupZoneInput } from '../types/shopify-inputs'
import { createMethodDefinition } from './profile-utils'

export class ShippingRatesProfileBuilders {
  buildReplacementProfileInput(
    existingMethodIds: string[], 
    newRates: ShippingRate[], 
    profile: DeliveryProfile
  ): DeliveryProfileInput {
    const locationGroupsUpdate: DeliveryProfileLocationGroupInput[] = []
    
    for (const locationGroup of profile.profileLocationGroups || []) {
      const zones: DeliveryLocationGroupZoneInput[] = []
      
      for (const zoneEdge of locationGroup.locationGroupZones?.edges || []) {
        const zoneNode = zoneEdge.node
        const zoneRates = newRates.filter(rate => rate.zoneId === zoneNode.zone.id)
        
        zones.push({
          id: zoneNode.zone.id,
          methodDefinitionsToCreate: zoneRates.map(rate => createMethodDefinition(rate))
        })
      }
      
      locationGroupsUpdate.push({
        id: locationGroup.locationGroup.id,
        zonesToUpdate: zones
      })
    }

    return {
      methodDefinitionsToDelete: existingMethodIds,
      locationGroupsToUpdate: locationGroupsUpdate
    }
  }

  buildSelectiveUpdateProfileInput(
    newRates: ShippingRate[], 
    profile: DeliveryProfile
  ): DeliveryProfileInput {
    const locationGroupsUpdate: DeliveryProfileLocationGroupInput[] = []
    const ratesToDelete: string[] = []
    
    for (const locationGroup of profile.profileLocationGroups || []) {
      const zones: DeliveryLocationGroupZoneInput[] = []
      
      for (const zoneEdge of locationGroup.locationGroupZones?.edges || []) {
        const zoneNode = zoneEdge.node
        const zoneRates = newRates.filter(rate => rate.zoneId === zoneNode.zone.id)
        
        if (zoneRates.length > 0) {
          const existingRatesToDelete = zoneRates
            .filter(rate => rate.id)
            .map(rate => rate.id!)
          
          ratesToDelete.push(...existingRatesToDelete)
          
          zones.push({
            id: zoneNode.zone.id,
            methodDefinitionsToCreate: zoneRates.map(rate => createMethodDefinition(rate))
          })
        }
      }
      
      if (zones.length > 0) {
        locationGroupsUpdate.push({
          id: locationGroup.locationGroup.id,
          zonesToUpdate: zones
        })
      }
    }

    return {
      methodDefinitionsToDelete: ratesToDelete,
      locationGroupsToUpdate: locationGroupsUpdate
    }
  }
}
