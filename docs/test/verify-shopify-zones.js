/**
 * Verify what shipping zones are currently visible in Shopify
 * after the deployment process reports success
 */

require('dotenv').config()

async function verifyShopifyZones() {
  console.log('🔍 Verifying Shopify Shipping Zones Post-Deployment...\n')

  try {
    // Test each zone by trying to fetch delivery options
    console.log('📊 Testing delivery options for each zone:')
    
    const zones = [
      { id: 0, name: 'Germany', countries: ['DE'] },
      { id: 1, name: 'Austria/Belgium/France', countries: ['AT', 'BE', 'FR'] },
      { id: 2, name: 'Bulgaria/Croatia/Czechia', countries: ['BG', 'HR', 'CZ'] },
      { id: 3, name: 'Italy/Sweden', countries: ['IT', 'SE'] },
      { id: 4, name: 'Norway/Switzerland', countries: ['NO', 'CH'] },
      { id: 5, name: 'Unknown Zone 5', countries: [] },
      { id: 6, name: 'United States', countries: ['US'] },
      { id: 7, name: 'Unknown Zone 7', countries: [] }
    ]

    for (const zone of zones) {
      if (zone.countries.length > 0) {
        const testCountry = zone.countries[0]
        
        try {
          const response = await fetch('http://localhost:3000/api/rates/delivery-options', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              weight: 1.5,
              country_code: testCountry
            })
          })

          const data = await response.json()
          
          if (response.ok && data.data?.length > 0) {
            console.log(`   ✅ Zone ${zone.id} (${zone.name}): ${data.data.length} options available`)
            console.log(`      Sample: ${data.data[0].name} - $${data.data[0].price}`)
          } else {
            console.log(`   ❌ Zone ${zone.id} (${zone.name}): No options available`)
            if (data.error) {
              console.log(`      Error: ${data.error}`)
            }
          }
        } catch (error) {
          console.log(`   ❌ Zone ${zone.id} (${zone.name}): Request failed - ${error.message}`)
        }
      } else {
        console.log(`   ⚪ Zone ${zone.id} (${zone.name}): No test countries defined`)
      }
    }

    // Also check our database to confirm rates exist
    console.log('\n📊 Database verification:')
    
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const ratesByZone = await prisma.generated_rates.groupBy({
        by: ['zone_id', 'zone_name'],
        _count: {
          id: true
        },
        orderBy: {
          zone_id: 'asc'
        }
      })

      ratesByZone.forEach(zone => {
        console.log(`   Zone ${zone.zone_id} (${zone.zone_name}): ${zone._count.id} rates in database`)
      })

      console.log(`\n📈 Summary:`)
      console.log(`   Total zones with data: ${ratesByZone.length}`)
      console.log(`   Total rates in database: ${ratesByZone.reduce((sum, z) => sum + z._count.id, 0)}`)

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

if (require.main === module) {
  verifyShopifyZones()
}

module.exports = { verifyShopifyZones }
