import { NextRequest, NextResponse } from 'next/server'
import { CSVUploadService } from '../../../../services/csv-upload'

/**
 * POST /api/shipping-rates/upload
 * Upload CSV file to replace all shipping rates in a delivery profile
 * 
 * Expected CSV format:
 * zone_name,rate_title,price
 * Brazil,Standard Shipping,9.99
 * Brazil,Express Shipping,19.99
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const profileId = formData.get('profileId') as string

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'CSV file is required',
        data: { message: 'No file provided' },
        meta: { totalRows: 0, successCount: 0, errorCount: 0 }
      }, { status: 400 })
    }

    if (!profileId) {
      return NextResponse.json({
        success: false,
        error: 'Profile ID is required',
        data: { message: 'No profile ID provided' },
        meta: { totalRows: 0, successCount: 0, errorCount: 0 }
      }, { status: 400 })
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        error: 'File must be a CSV file',
        data: { message: 'Invalid file type' },
        meta: { totalRows: 0, successCount: 0, errorCount: 0 }
      }, { status: 400 })
    }

    // Read CSV content
    const csvContent = await file.text()
    
    if (!csvContent.trim()) {
      return NextResponse.json({
        success: false,
        error: 'CSV file is empty',
        data: { message: 'No content in file' },
        meta: { totalRows: 0, successCount: 0, errorCount: 0 }
      }, { status: 400 })
    }

    // Process CSV upload
    const uploadService = new CSVUploadService()
    const result = await uploadService.processCsvUpload(csvContent, profileId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: `${result.errorCount} validation errors`,
        data: { 
          message: 'CSV validation failed',
          errors: result.errors,
          errorCsv: result.errorCsv
        },
        meta: { 
          totalRows: result.totalRows, 
          successCount: result.successCount, 
          errorCount: result.errorCount 
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { 
        message: `Successfully uploaded ${result.successCount} shipping rates`,
        totalRows: result.totalRows,
        successCount: result.successCount
      },
      meta: { 
        totalRows: result.totalRows, 
        successCount: result.successCount, 
        errorCount: result.errorCount 
      }
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: { message: 'Server error during CSV upload' },
      meta: { totalRows: 0, successCount: 0, errorCount: 0 }
    }, { status: 500 })
  }
}
