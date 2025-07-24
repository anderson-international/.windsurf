// Extract all zones for CSV template
async function extractZones() {
  try {
    const response = await fetch('http://localhost:3000/api/zones')
    const result = await response.json()
    
    console.log('📍 Extracting zones for CSV template...\n')
    
    // Get unique zone names and sort them
    const uniqueZones = [...new Set(result.data.map(z => z.name))]
      .sort()
      .slice(0, 50) // Limit to first 50 for template
    
    console.log(`Found ${result.data.length} total zones, ${uniqueZones.length} unique`)
    console.log('\nUnique zone names for template:')
    
    uniqueZones.forEach((zone, i) => {
      console.log(`${i+1}. ${zone}`)
    })
    
    // Generate CSV template content
    console.log('\n📝 CSV Template Content:')
    console.log('zone_name,rate_title,price')
    
    // Add examples for first 10 zones
    uniqueZones.slice(0, 10).forEach(zone => {
      console.log(`${zone},Standard Shipping,9.99`)
      console.log(`${zone},Express Shipping,19.99`)
    })
    
  } catch (error) {
    console.error('❌ Failed to extract zones:', error.message)
  }
}

extractZones()
