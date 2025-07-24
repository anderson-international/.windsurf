// Quick verification of Brazil rate update
async function verify() {
  const response = await fetch('http://localhost:3000/api/shipping-rates')
  const result = await response.json()
  
  const brazilRates = result.data.filter(rate => 
    rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
  )
  
  console.log('🇧🇷 Brazil Rates After Update:')
  console.log(JSON.stringify(brazilRates, null, 2))
}

verify().catch(console.error)
