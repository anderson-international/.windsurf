import { ShippingRate } from '../types/api'
import { ShopifyService } from './shopify'
import { ShippingRatesReplacementService } from './shipping-rates-replacement'
import { ShopifyDeliveryProfilesResponse } from '../types/shopify-responses'

interface CSVRow {
  zone_name: string
  rate_title: string
  price: string
}

interface CSVError {
  row: number
  zone_name: string
  rate_title: string
  price: string
  error: string
}

interface CSVUploadResult {
  success: boolean
  totalRows: number
  successCount: number
  errorCount: number
  errors: CSVError[]
  errorCsv?: string
}

interface ZoneInfo {
  id: string
  name: string
}

export class CSVUploadService {
  private shopifyService: ShopifyService
  private replacementService: ShippingRatesReplacementService

  constructor() {
    this.shopifyService = new ShopifyService()
    this.replacementService = new ShippingRatesReplacementService()
  }

  async processCsvUpload(csvContent: string, profileId: string): Promise<CSVUploadResult> {
    const rows = this.parseCsv(csvContent)
    const { validRates, errors } = await this.validateRows(rows)

    if (errors.length > 0) {
      return {
        success: false,
        totalRows: rows.length,
        successCount: 0,
        errorCount: errors.length,
        errors,
        errorCsv: this.generateErrorCsv(errors)
      }
    }

    // Use complete replacement
    const result = await this.replacementService.replaceAllShippingRates(profileId, validRates)

    if (!result.success) {
      const uploadError: CSVError = {
        row: 0,
        zone_name: 'UPLOAD',
        rate_title: 'FAILED',
        price: '0',
        error: result.errors?.join(', ') || 'Unknown upload error'
      }

      return {
        success: false,
        totalRows: rows.length,
        successCount: 0,
        errorCount: 1,
        errors: [uploadError],
        errorCsv: this.generateErrorCsv([uploadError])
      }
    }

    return {
      success: true,
      totalRows: rows.length,
      successCount: validRates.length,
      errorCount: 0,
      errors: []
    }
  }

  private parseCsv(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    return lines.slice(1)
      .filter(line => line.trim()) // Skip empty lines
      .map(line => {
        const values = line.split(',').map(v => v.trim())
        const row: any = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        return row as CSVRow
      })
  }

  private async validateRows(rows: CSVRow[]): Promise<{ validRates: ShippingRate[], errors: CSVError[] }> {
    const validRates: ShippingRate[] = []
    const errors: CSVError[] = []

    // Get available zones for validation
    const profilesResponse = await this.shopifyService.getDeliveryProfiles()
    const zoneMap = this.buildZoneMap(profilesResponse)

    rows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because index is 0-based and we skip header
      const error = this.validateRow(row, zoneMap)

      if (error) {
        errors.push({
          row: rowNumber,
          zone_name: row.zone_name,
          rate_title: row.rate_title,
          price: row.price,
          error
        })
      } else {
        const zone = zoneMap[row.zone_name.toLowerCase()]
        validRates.push({
          id: `csv_${Date.now()}_${index}`, // Generate unique ID
          title: row.rate_title,
          profileName: 'General Profile',
          zoneId: zone.id,
          zoneName: zone.name,
          currency: 'GBP',
          price: parseFloat(row.price)
        })
      }
    })

    return { validRates, errors }
  }

  private validateRow(row: CSVRow, zoneMap: Record<string, ZoneInfo>): string | null {
    // Check required fields
    if (!row.zone_name?.trim()) {
      return 'Zone name is required'
    }
    
    if (!row.rate_title?.trim()) {
      return 'Rate title is required'
    }
    
    if (!row.price?.trim()) {
      return 'Price is required'
    }

    // Validate zone exists
    const zoneName = row.zone_name.toLowerCase()
    if (!zoneMap[zoneName]) {
      return `Zone '${row.zone_name}' not found`
    }

    // Validate price is a valid number
    const price = parseFloat(row.price)
    if (isNaN(price) || price < 0) {
      return 'Price must be a valid positive number'
    }

    return null
  }

  private buildZoneMap(profilesResponse: ShopifyDeliveryProfilesResponse): Record<string, ZoneInfo> {
    const zoneMap: Record<string, ZoneInfo> = {}

    profilesResponse.deliveryProfiles.edges.forEach(profileEdge => {
      const profile = profileEdge.node
      
      profile.profileLocationGroups?.forEach(locationGroup => {
        locationGroup.locationGroupZones?.edges.forEach(zoneEdge => {
          const zoneNode = zoneEdge.node
          const zoneName = zoneNode.zone.name.toLowerCase()
          
          zoneMap[zoneName] = {
            id: zoneNode.zone.id,
            name: zoneNode.zone.name
          }
        })
      })
    })

    return zoneMap
  }

  private generateErrorCsv(errors: CSVError[]): string {
    const header = 'row,zone_name,rate_title,price,error'
    const rows = errors.map(error => 
      `${error.row},"${error.zone_name}","${error.rate_title}","${error.price}","${error.error}"`
    )
    
    return [header, ...rows].join('\n')
  }
}
