/**
 * Helper script to identify the best zone for testing our duplicate prevention fix
 * Finds zones with existing rates and duplicates to validate our fix
 */

require('dotenv').config()

async function selectZoneForTesting() {
  console.log('🔍 Analyzing zones to find best candidate for testing...\n')

  try {
    console.log('📡 Fetching all shipping rates from API...')
    
    const response = await fetch('http://localhost:3000/api/shipping-rates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success || !data.data) {
      throw new Error(`Invalid API response: ${data.error}`)
    }

    console.log(`📊 Found ${data.data.length} total shipping rates`)
    
    // Group rates by zone
    const zoneGroups = {}
    data.data.forEach(rate => {
      const zoneId = rate.zoneId || rate.zone_id
      if (!zoneGroups[zoneId]) {
        zoneGroups[zoneId] = []
      }
      zoneGroups[zoneId].push(rate)
    })

    console.log(`\n🌍 Found ${Object.keys(zoneGroups).length} unique zones\n`)

    // Analyze each zone
    const zoneAnalysis = []
    
    for (const [zoneId, rates] of Object.entries(zoneGroups)) {
      const titles = rates.map(rate => rate.title || rate.rate_title || 'Untitled')
      const uniqueTitles = [...new Set(titles)]
      const hasDuplicates = titles.length !== uniqueTitles.length
      const duplicateCount = titles.length - uniqueTitles.length
      
      zoneAnalysis.push({
        zoneId,
        totalRates: rates.length,
        uniqueTitles: uniqueTitles.length,
        hasDuplicates,
        duplicateCount,
        sampleTitle: titles[0] || 'N/A'
      })
    }

    // Sort by zones with most duplicates first
    zoneAnalysis.sort((a, b) => {
      if (a.hasDuplicates && !b.hasDuplicates) return -1
      if (!a.hasDuplicates && b.hasDuplicates) return 1
      return b.duplicateCount - a.duplicateCount
    })

    console.log('📋 Zone Analysis Results:')
    console.log('=' .repeat(80))
    
    zoneAnalysis.forEach((zone, index) => {
      const status = zone.hasDuplicates ? '🔴 HAS DUPLICATES' : '✅ Clean'
      const priority = index < 3 ? '⭐ PRIORITY' : ''
      
      console.log(`${zone.zoneId}`)
      console.log(`   Status: ${status} ${priority}`)
      console.log(`   Total Rates: ${zone.totalRates}`)
      console.log(`   Unique Titles: ${zone.uniqueTitles}`)
      if (zone.hasDuplicates) {
        console.log(`   Duplicate Count: ${zone.duplicateCount}`)
      }
      console.log(`   Sample Title: "${zone.sampleTitle}"`)
      console.log('')
    })

    // Recommend best test candidate
    const bestCandidate = zoneAnalysis.find(zone => zone.hasDuplicates && zone.totalRates > 5)
    
    if (bestCandidate) {
      console.log('🎯 RECOMMENDED TEST ZONE:')
      console.log('=' .repeat(50))
      console.log(`Zone ID: ${bestCandidate.zoneId}`)
      console.log(`Why: Has ${bestCandidate.duplicateCount} duplicates among ${bestCandidate.totalRates} rates`)
      console.log(`Perfect for testing our duplicate prevention fix!`)
      console.log('')
      console.log('✅ Copy this zone ID to test with:')
      console.log(`"${bestCandidate.zoneId}"`)
    } else {
      console.log('⚠️  No zones with duplicates found - may already be clean!')
      console.log('Using any zone with rates:')
      const anyZone = zoneAnalysis.find(zone => zone.totalRates > 0)
      if (anyZone) {
        console.log(`"${anyZone.zoneId}"`)
      }
    }

  } catch (error) {
    console.error('❌ Zone selection failed:', error.message)
  }
}

if (require.main === module) {
  selectZoneForTesting()
}

module.exports = { selectZoneForTesting }
