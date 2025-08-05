/**
 * Default Profile Zones Inspector
 * Fetches and displays zones ONLY from the General Profile (default: true)
 * Uses the same logic as our live zone fetching system
 */

require('dotenv').config();

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

async function fetchGeneralProfileZones() {
  const query = `
    query GetShippingZones {
      deliveryProfiles(first: 10) {
        edges {
          node {
            id
            name
            default
            profileLocationGroups {
              locationGroup {
                id
              }
              locationGroupZones(first: 50) {
                edges {
                  node {
                    zone {
                      id
                      name
                      countries {
                        code {
                          countryCode
                        }
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

async function inspectGeneralProfileZones() {
  console.log('='.repeat(70));
  console.log('📋 GENERAL PROFILE ZONES INSPECTOR');
  console.log('='.repeat(70));
  console.log();

  try {
    const data = await fetchGeneralProfileZones();
    
    // Find the General Profile (default profile)
    const generalProfile = data.deliveryProfiles.edges.find(
      edge => edge.node.default === true
    );
    
    if (!generalProfile) {
      console.error('❌ No General Profile (default: true) found!');
      return;
    }
    
    const profile = generalProfile.node;
    console.log(`✅ Found General Profile: "${profile.name}"`);
    console.log(`   Profile ID: ${profile.id}`);
    console.log(`   Default: ${profile.default}`);
    console.log();
    
    // Extract zones from General Profile only
    const zones = [];
    
    for (const locationGroup of profile.profileLocationGroups) {
      console.log(`📍 Location Group ID: ${locationGroup.locationGroup.id}`);
      console.log();
      
      for (const zoneEdge of locationGroup.locationGroupZones.edges) {
        const zone = zoneEdge.node.zone;
        zones.push(zone);
        
        console.log(`   🌍 Zone: "${zone.name}"`);
        console.log(`      Zone ID: ${zone.id}`);
        
        if (zone.countries && zone.countries.length > 0) {
          console.log(`      Countries:`);
          for (const country of zone.countries) {
            const code = country.code?.countryCode || 'REST_OF_WORLD';
            console.log(`        - ${country.name} (${code})`);
          }
        } else {
          console.log(`      Countries: REST_OF_WORLD`);
        }
        console.log();
      }
    }
    
    // Summary
    console.log('='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ General Profile zones found: ${zones.length}`);
    console.log(`📋 Zone names: ${zones.map(z => z.name).sort().join(', ')}`);
    console.log();
    console.log('🎯 These are the zones our shipping rate system manages:');
    zones.forEach((zone, index) => {
      console.log(`   ${index + 1}. ${zone.name}`);
    });
    
    console.log();
    console.log('💡 All other delivery profiles and their zones are ignored by our system.');
    
  } catch (error) {
    console.error('❌ Error fetching General Profile zones:', error.message);
  }
}

// Run the inspector
inspectGeneralProfileZones();
