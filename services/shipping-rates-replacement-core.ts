import { ShopifyService } from './shopify'
import { ShippingRate } from '../types/api'
import { findProfileById, extractAllMethodDefinitionIds } from './profile-utils'
import { ShippingRatesProfileBuilders } from './shipping-rates-profile-builders'

export class ShippingRatesReplacementService {
  private shopifyService: ShopifyService
  private profileBuilders: ShippingRatesProfileBuilders

  constructor() {
    this.shopifyService = new ShopifyService()
    this.profileBuilders = new ShippingRatesProfileBuilders()
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
    const profileInput = this.profileBuilders.buildReplacementProfileInput(existingMethodIds, newRates, profile)
    
    const result = await this.shopifyService.updateDeliveryProfile(profileId, profileInput)
    
    if (result.deliveryProfileUpdate.userErrors.length > 0) {
      return {
        success: false,
        errors: result.deliveryProfileUpdate.userErrors.map(error => error.message)
      }
    }

    return { success: true }
  }

  async updateSpecificRates(profileId: string, newRates: ShippingRate[]): Promise<{ success: boolean; errors?: string[] }> {
    const profilesResponse = await this.shopifyService.getDeliveryProfiles()
    const profile = findProfileById(profilesResponse, profileId)
    
    if (!profile) {
      return {
        success: false,
        errors: [`Profile with ID ${profileId} not found`]
      }
    }

    const profileInput = this.profileBuilders.buildSelectiveUpdateProfileInput(newRates, profile)
    
    const result = await this.shopifyService.updateDeliveryProfile(profileId, profileInput)
    
    if (result.deliveryProfileUpdate.userErrors.length > 0) {
      return {
        success: false,
        errors: result.deliveryProfileUpdate.userErrors.map(error => error.message)
      }
    }

    return { success: true }
  }
}
