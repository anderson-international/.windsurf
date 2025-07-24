// Analyze ACTUAL shipping zones from your Shopify setup
async function analyzeActualZones() {
  console.log('🔍 ANALYZING YOUR ACTUAL SHOPIFY ZONES...\n');

  try {
    // Get zones data
    const response = await fetch('http://localhost:3000/api/zones');
    const result = await response.json();
    
    if (!result.success) {
      console.log('❌ Failed to fetch zones:', result.error);
      return;
    }

    const zones = result.data;
    console.log(`📊 TOTAL ZONES FOUND: ${zones.length}\n`);

    // Group zones by profile
    const zonesByProfile = {};
    zones.forEach(zone => {
      if (!zonesByProfile[zone.profileName]) {
        zonesByProfile[zone.profileName] = [];
      }
      zonesByProfile[zone.profileName].push(zone);
    });

    // Analyze each profile
    console.log('📋 ZONES BY DELIVERY PROFILE:');
    Object.keys(zonesByProfile).forEach(profileName => {
      const profileZones = zonesByProfile[profileName];
      console.log(`\n🏷️  ${profileName} (${profileZones.length} zones):`);
      
      profileZones
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((zone, i) => {
          console.log(`   ${i+1}. "${zone.name}" (${zone.rateCount} rates)`);
          console.log(`      ID: ${zone.id}`);
        });
    });

    // Analyze zone naming patterns
    console.log('\n\n🏷️  ZONE NAMING ANALYSIS:');
    
    const zoneNames = zones.map(z => z.name).sort();
    
    // Count patterns
    const patterns = {
      numbered: zoneNames.filter(name => /^Zone \d+$/.test(name)),
      geographical: zoneNames.filter(name => !/^Zone \d+$/.test(name) && !['Canada', 'United Kingdom'].includes(name)),
      exceptions: zoneNames.filter(name => ['Canada', 'United Kingdom'].includes(name))
    };

    console.log(`📊 Pattern Analysis:`);
    console.log(`   • Numbered zones (Zone X): ${patterns.numbered.length}`);
    console.log(`   • Geographical zones: ${patterns.geographical.length}`);
    console.log(`   • Named exceptions: ${patterns.exceptions.length}`);

    console.log(`\n📝 NUMBERED ZONES (Zone X):`);
    patterns.numbered.forEach(name => console.log(`   • ${name}`));

    console.log(`\n🌍 GEOGRAPHICAL ZONES:`);
    patterns.geographical.slice(0, 20).forEach(name => console.log(`   • ${name}`));
    if (patterns.geographical.length > 20) {
      console.log(`   ... and ${patterns.geographical.length - 20} more`);
    }

    console.log(`\n🏷️  NAMED EXCEPTIONS:`);
    patterns.exceptions.forEach(name => console.log(`   • ${name}`));

    // Suggest CSV template zones
    console.log(`\n\n📋 CSV TEMPLATE ZONES TO USE:`);
    console.log(`Based on your actual zone structure:\n`);
    
    const templateZones = [...patterns.numbered, ...patterns.exceptions]
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
    
    templateZones.forEach((zone, i) => {
      console.log(`${i+1}. ${zone}`);
    });

    console.log(`\n🎯 RECOMMENDATION:`);
    if (patterns.numbered.length > 0) {
      console.log(`Use your numbered zones (${patterns.numbered.length} zones) + named exceptions (${patterns.exceptions.length} zones)`);
      console.log(`Total zones for CSV template: ${templateZones.length}`);
    } else {
      console.log(`Use all geographical zone names found: ${patterns.geographical.length} zones`);
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeActualZones();
