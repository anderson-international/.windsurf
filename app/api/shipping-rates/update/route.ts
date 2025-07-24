import { NextRequest, NextResponse } from 'next/server'
import { ShippingRatesReplacementService } from '../../../../services/shipping-rates-replacement'

/**
 * PATCH /api/shipping-rates/update
 * Update specific shipping rates without affecting other rates
 * Only modifies/creates the specified rates, leaves others untouched
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, rates } = body
    
    if (!profileId || typeof profileId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Profile ID is required and must be a string',
        data: { message: 'Invalid profile ID' },
        meta: { totalCount: 0 }
      }, { status: 400 })
    }
    
    if (!Array.isArray(rates) || rates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one rate is required',
        data: { message: 'No rates provided' },
        meta: { totalCount: 0 }
      }, { status: 400 })
    }
    
    const updateService = new ShippingRatesReplacementService()
    const result = await updateService.updateSpecificRates(profileId, rates)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.errors?.join(', ') || 'Unknown error',
        data: { message: 'Failed to update shipping rates' },
        meta: { totalCount: 0 }
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: { message: 'Shipping rates updated successfully' },
      meta: { totalCount: rates.length }
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: { message: 'Server error during update' },
      meta: { totalCount: 0 }
    }, { status: 500 })
  }
}
