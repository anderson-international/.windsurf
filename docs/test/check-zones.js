// Quick zones check for CSV design
async function checkZones() {
  const response = await fetch('http://localhost:3000/api/zones')
  const result = await response.json()
  
  console.log('📍 Available Zones for CSV:')
  console.log(`Total zones: ${result.data.length}`)
  console.log('\nFirst 10 zones:')
  result.data.slice(0, 10).forEach((zone, i) => {
    console.log(`${i+1}. ${zone.name} (${zone.id})`)
  })
  
  console.log('\nUnique zone names:')
  const uniqueNames = [...new Set(result.data.map(z => z.name))].slice(0, 10)
  uniqueNames.forEach(name => console.log(`- ${name}`))
}

checkZones().catch(console.error)
