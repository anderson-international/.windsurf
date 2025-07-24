import { ShopifyService } from './shopify'
import { ShippingRate } from '../types/api'
import { DeliveryProfile } from '../types/shopify-responses'
import { DeliveryProfileInput, DeliveryProfileLocationGroupInput, DeliveryLocationGroupZoneInput } from '../types/shopify-inputs'
import { findProfileById, extractAllMethodDefinitionIds, createMethodDefinition } from './profile-utils'

export class ShippingRatesReplacementService {
  private shopifyService: ShopifyService

  constructor() {
    this.shopifyService = new ShopifyService()
  }

  async replaceAllShippingRates(profileId: string, newRates: ShippingRate[]): Promise<{ success: boolean; errors?: string[] }> {
    const profilesResponse = await this.shopifyService.getDeliveryProfiles()
    const profile = findProfileById(profilesResponse, profileId)
    
    if (!profile) {
      return {
        success: false,
        errors: [`Profile with ID ${profileId} not found`]
      }
    }

    const existingMethodIds = extractAllMethodDefinitionIds(profile)
    const profileInput = this.buildReplacementProfileInput(existingMethodIds, newRates, profile)
    
    const result = await this.shopifyService.updateDeliveryProfile(profileId, profileInput)
    
    if (result.deliveryProfileUpdate.userErrors.length > 0) {
      return {
        success: false,
        errors: result.deliveryProfileUpdate.userErrors.map(error => error.message)
      }
    }

    return { success: true }
  }



  private buildReplacementProfileInput(
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

  /**
   * Update specific shipping rates without affecting other rates
   * Only modifies/creates the specified rates, leaves others untouched
   */
  async updateSpecificRates(profileId: string, newRates: ShippingRate[]): Promise<{ success: boolean; errors?: string[] }> {
    const profilesResponse = await this.shopifyService.getDeliveryProfiles()
    const profile = findProfileById(profilesResponse, profileId)
    
    if (!profile) {
      return {
        success: false,
        errors: [`Profile with ID ${profileId} not found`]
      }
    }

    const profileInput = this.buildSelectiveUpdateProfileInput(newRates, profile)
    
    const result = await this.shopifyService.updateDeliveryProfile(profileId, profileInput)
    
    if (result.deliveryProfileUpdate.userErrors.length > 0) {
      return {
        success: false,
        errors: result.deliveryProfileUpdate.userErrors.map(error => error.message)
      }
    }

    return { success: true }
  }

  private buildSelectiveUpdateProfileInput(
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
          // Find existing rates to delete (rates with same ID being "updated")
          const existingRatesToDelete = zoneRates
            .filter(rate => rate.id) // Only if rate has existing ID
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
      methodDefinitionsToDelete: ratesToDelete, // Delete old rates being "updated"
      locationGroupsToUpdate: locationGroupsUpdate
    }
  }


}
