const { PrismaClient } = require('@prisma/client')

async function checkDatabaseRates() {
  const prisma = new PrismaClient()
  
  try {
    const zoneId = 'gid://shopify/DeliveryZone/302956380367'
    console.log(`🔍 Checking database rates for zone: ${zoneId}`)
    
    const rates = await prisma.generated_rates.findMany({
      where: {
        zone_id: zoneId
      }
    })
    
    console.log(`📊 Found ${rates.length} rates in database for this zone`)
    
    if (rates.length > 0) {
      console.log('✅ Sample rate structure:')
      console.log(JSON.stringify(rates[0], null, 2))
    } else {
      console.log('❌ No rates found in database - this explains the 404!')
      
      // Check if we have any rates at all
      const totalRates = await prisma.generated_rates.count()
      console.log(`📈 Total rates in database: ${totalRates}`)
      
      if (totalRates > 0) {
        const sampleZones = await prisma.generated_rates.findMany({
          select: { zone_id: true },
          distinct: ['zone_id'],
          take: 5
        })
        console.log('📋 Sample zone IDs that do have rates:')
        sampleZones.forEach(zone => console.log(`   - ${zone.zone_id}`))
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkDatabaseRates()
}

module.exports = { checkDatabaseRates }
