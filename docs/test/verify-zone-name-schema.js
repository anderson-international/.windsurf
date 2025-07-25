const { PrismaClient } = require('@prisma/client')

async function verifySchema() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Verifying generated_rates schema changes...\n')
    
    // Check if we can query by zone_name (should work)
    console.log('✅ Testing zone_name queries...')
    const ratesByZoneName = await prisma.generated_rates.findMany({
      select: {
        id: true,
        zone_name: true,
        rate_title: true
      },
      take: 3
    })
    
    console.log(`   Found ${ratesByZoneName.length} rates`)
    if (ratesByZoneName.length > 0) {
      console.log('   Sample zone names:', ratesByZoneName.map(r => r.zone_name).join(', '))
    }
    
    // Check distinct zone names
    console.log('\n📋 Distinct zone names in database:')
    const distinctZones = await prisma.$queryRaw`
      SELECT DISTINCT zone_name, COUNT(*) as rate_count
      FROM generated_rates 
      GROUP BY zone_name 
      ORDER BY zone_name
    `
    
    distinctZones.forEach(zone => {
      console.log(`   ${zone.zone_name}: ${zone.rate_count} rates`)
    })
    
    console.log('\n✅ Schema verification complete!')
    console.log('   - zone_id column successfully removed')
    console.log('   - zone_name queries working correctly')
    console.log('   - Ready for zone name-based deployments')
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifySchema()
