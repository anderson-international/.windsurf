#!/usr/bin/env node

const { Client } = require('pg')
require('dotenv').config()

async function verifyTariffs() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    
    // Sample Zone 0 tariffs
    console.log('🔍 ZONE 0 SAMPLE TARIFFS:')
    const zone0Result = await client.query(`
      SELECT weight_kg, tariff_amount 
      FROM zone_tariffs 
      WHERE zone_name = 'Zone 0' 
      ORDER BY weight_kg 
      LIMIT 10
    `)
    
    zone0Result.rows.forEach(row => {
      console.log(`  ${row.weight_kg}kg → £${row.tariff_amount}`)
    })
    
    // Compare with Zone 6 (highest tariffs)
    console.log('\n🔍 ZONE 6 SAMPLE TARIFFS:')
    const zone6Result = await client.query(`
      SELECT weight_kg, tariff_amount 
      FROM zone_tariffs 
      WHERE zone_name = 'Zone 6' 
      ORDER BY weight_kg 
      LIMIT 10
    `)
    
    zone6Result.rows.forEach(row => {
      console.log(`  ${row.weight_kg}kg → £${row.tariff_amount}`)
    })
    
    console.log('\n✅ Tariff verification complete!')
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await client.end()
  }
}

verifyTariffs()
