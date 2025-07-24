// Extract unique zone names for CSV template
async function extractUniqueZones() {
  console.log('📋 EXTRACTING UNIQUE ZONE NAMES FOR CSV TEMPLATE...\n');

  try {
    const response = await fetch('http://localhost:3000/api/zones');
    const result = await response.json();
    
    if (!result.success) {
      console.log('❌ Failed to fetch zones:', result.error);
      return;
    }

    // Get unique zone names only
    const uniqueZoneNames = [...new Set(result.data.map(zone => zone.name))]
      .sort((a, b) => {
        // Sort Zone X numerically, then alphabetically
        const aMatch = a.match(/^Zone (\d+)$/);
        const bMatch = b.match(/^Zone (\d+)$/);
        
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return a.localeCompare(b);
      });

    console.log(`📊 UNIQUE ZONE NAMES (${uniqueZoneNames.length} total):`);
    uniqueZoneNames.forEach((name, i) => {
      console.log(`${i+1}. ${name}`);
    });

    // Identify patterns
    const numbered = uniqueZoneNames.filter(name => /^Zone \d+$/.test(name));
    const named = uniqueZoneNames.filter(name => !/^Zone \d+$/.test(name));

    console.log(`\n📈 PATTERN BREAKDOWN:`);
    console.log(`   • Numbered zones: ${numbered.length}`);
    console.log(`   • Named zones: ${named.length}`);

    // Generate CSV template
    console.log(`\n📋 CSV TEMPLATE FOR YOUR ZONES:`);
    console.log('zone_name,rate_title,price');
    
    uniqueZoneNames.forEach(zoneName => {
      console.log(`${zoneName},Standard Shipping,9.99`);
      console.log(`${zoneName},Express Shipping,19.99`);
    });

  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
  }
}

extractUniqueZones();
