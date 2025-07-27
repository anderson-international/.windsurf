#!/usr/bin/env node

/**
 * Zone Tariff Seeding Script
 * 
 * Extracts Parcel 1 tariffs from zone CSV files and seeds the database
 * with tariff data mapped to actual Shopify zone IDs.
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
require('dotenv').config()

class TariffSeeder {
  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    this.zoneMapping = new Map()
  }

  async connect() {
    await this.client.connect()
    console.log('✅ Database connected')
  }

  async disconnect() {
    await this.client.end()
    console.log('✅ Database disconnected')
  }

  /**
   * Fetch zone mapping from API
   */
  async fetchZoneMapping() {
    try {
      const response = await fetch('http://localhost:3000/api/zones')
      const result = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format')
      }
      
      const zones = result.data
      
      // Map zone names to IDs
      zones.forEach(zone => {
        // Handle both "Zone X" format and other zone names
        const zoneName = zone.name
        this.zoneMapping.set(zoneName, zone.id)
        
        // Also map "Zone 0" format if the name contains numbers
        const zoneMatch = zoneName.match(/Zone (\d+)/)
        if (zoneMatch) {
          this.zoneMapping.set(`Zone ${zoneMatch[1]}`, zone.id)
        }
      })
      
      console.log(`✅ Loaded ${this.zoneMapping.size} zone mappings`)
      
      // Debug: Show first few mappings
      const entries = Array.from(this.zoneMapping.entries()).slice(0, 5)
      console.log('Sample mappings:', entries)
      
    } catch (error) {
      console.error('❌ Failed to fetch zone mapping:', error.message)
      throw error
    }
  }

  /**
   * Parse CSV file and extract Parcel 1 tariffs
   */
  parseCsvFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    const tariffs = []
    
    // Start from line 5 (index 4) where data begins
    for (let i = 4; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const columns = line.split(',')
      const weight = parseFloat(columns[0])
      const tariff = parseFloat(columns[1])
      
      // Only process valid Parcel 1 data (up to 2.00kg)
      if (!isNaN(weight) && !isNaN(tariff) && weight <= 2.00) {
        tariffs.push({
          weight_kg: weight,
          tariff_amount: tariff
        })
      }
    }
    
    return tariffs
  }

  /**
   * Extract zone number from filename
   */
  extractZoneNumber(filename) {
    const match = filename.match(/Zone (\d+)\.csv$/)
    return match ? parseInt(match[1]) : null
  }

  /**
   * Process all zone files
   */
  async processZoneFiles() {
    const zoneDir = path.join(__dirname, '../docs/test/Zone Rates')
    const files = fs.readdirSync(zoneDir).filter(f => f.endsWith('.csv'))
    
    console.log(`📁 Found ${files.length} zone files`)
    
    const allTariffs = []
    
    for (const file of files) {
      const filePath = path.join(zoneDir, file)
      const zoneNumber = this.extractZoneNumber(file)
      
      if (zoneNumber === null) {
        console.log(`⚠️ Skipping ${file} - cannot extract zone number`)
        continue
      }
      
      const zoneName = `Zone ${zoneNumber}`
      const zoneId = this.zoneMapping.get(zoneName)
      
      if (!zoneId) {
        console.log(`⚠️ Skipping ${zoneName} - no Shopify zone ID found`)
        continue
      }
      
      console.log(`📋 Processing ${zoneName} (${zoneId})`)
      
      const tariffs = this.parseCsvFile(filePath)
      
      // Add zone info to each tariff
      tariffs.forEach(tariff => {
        allTariffs.push({
          zone_id: zoneId,
          zone_name: zoneName,
          ...tariff
        })
      })
      
      console.log(`✅ Extracted ${tariffs.length} tariffs from ${zoneName}`)
    }
    
    return allTariffs
  }

  /**
   * Seed database with tariffs
   */
  async seedDatabase(tariffs) {
    console.log(`🌱 Seeding database with ${tariffs.length} tariffs...`)
    
    // Clear existing tariffs
    await this.client.query('DELETE FROM zone_tariffs')
    console.log('🗑️ Cleared existing tariffs')
    
    // Insert new tariffs in batches
    const batchSize = 50
    let inserted = 0
    
    for (let i = 0; i < tariffs.length; i += batchSize) {
      const batch = tariffs.slice(i, i + batchSize)
      
      const values = batch.map((_, index) => {
        const offset = index * 5
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`
      }).join(', ')
      
      const params = batch.flatMap(t => [t.zone_id, t.zone_name, t.weight_kg, t.tariff_amount, 1])
      
      const query = `
        INSERT INTO zone_tariffs (zone_id, zone_name, weight_kg, tariff_amount, carrier_id)
        VALUES ${values}
      `
      
      await this.client.query(query, params)
      inserted += batch.length
      
      console.log(`📥 Inserted ${inserted} / ${tariffs.length} tariffs`)
    }
    
    console.log('✅ Database seeding complete!')
  }

  /**
   * Verify seeded data
   */
  async verifyData() {
    const result = await this.client.query(`
      SELECT zone_name, COUNT(*) as tariff_count, 
             MIN(weight_kg) as min_weight, MAX(weight_kg) as max_weight,
             MIN(tariff_amount) as min_tariff, MAX(tariff_amount) as max_tariff
      FROM zone_tariffs 
      GROUP BY zone_name 
      ORDER BY zone_name
    `)
    
    console.log('\n📊 SEEDING VERIFICATION:')
    console.log('Zone Name        | Count | Weight Range | Tariff Range')
    console.log('-----------------|-------|--------------|-------------')
    
    result.rows.forEach(row => {
      console.log(
        `${row.zone_name.padEnd(16)} | ${row.tariff_count.toString().padStart(5)} | ` +
        `${row.min_weight}-${row.max_weight}kg  | £${row.min_tariff}-${row.max_tariff}`
      )
    })
    
    console.log(`\n✅ Total: ${result.rows.length} zones, ${result.rows.reduce((sum, r) => sum + parseInt(r.tariff_count), 0)} tariffs`)
  }

  async run() {
    try {
      await this.connect()
      await this.fetchZoneMapping()
      const tariffs = await this.processZoneFiles()
      await this.seedDatabase(tariffs)
      await this.verifyData()
    } catch (error) {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    } finally {
      await this.disconnect()
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new TariffSeeder()
  seeder.run()
}

module.exports = TariffSeeder
