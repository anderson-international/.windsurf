import { NextRequest, NextResponse } from 'next/server'
import { ShopifyService } from '../../../services/shopify'
import { ShippingRatesReplacementService } from '../../../services/shipping-rates-replacement'
import { transformShopifyData } from '../../../utils/shopify-transformers'

export async function GET(): Promise<NextResponse> {
  try {
    const shopifyService = new ShopifyService()
    const data = await shopifyService.getDeliveryProfiles()
    
    const shippingRates = transformShopifyData(data)
    
    return NextResponse.json({
      success: true,
      data: shippingRates,
      meta: {
        total: shippingRates.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shipping rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { profileId, rates } = body
    
    if (!profileId || !Array.isArray(rates)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: profileId and rates array',
        data: { message: 'Invalid request body' },
        meta: { totalCount: 0 }
      }, { status: 400 })
    }
    
    const replacementService = new ShippingRatesReplacementService()
    const result = await replacementService.replaceAllShippingRates(profileId, rates)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.errors?.join(', ') || 'Unknown error',
        data: { message: 'Failed to replace shipping rates' },
        meta: { totalCount: 0 }
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: { message: 'Shipping rates replaced successfully' },
      meta: { totalCount: rates.length }
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: { message: 'Server error during replacement' },
      meta: { totalCount: 0 }
    }, { status: 500 })
  }
}
