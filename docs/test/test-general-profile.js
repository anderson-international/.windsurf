/**
 * Test script to fetch only the General Profile zones
 * This will help us identify the correct query structure
 */

require('dotenv').config();

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

async function fetchGeneralProfileZones() {
  // First, let's identify the General profile by its characteristics
  const query = `
    query GetGeneralProfile {
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
              locationGroupZones(first: 100) {
                edges {
                  node {
                    zone {
                      id
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

async function testGeneralProfile() {
  console.log('='.repeat(60));
  console.log('GENERAL PROFILE ZONE FETCHER TEST');
  console.log('='.repeat(60));
  console.log();

  try {
    const data = await fetchGeneralProfileZones();
    
    console.log('📋 All Delivery Profiles:');
    console.log();
    
    for (const profileEdge of data.deliveryProfiles.edges) {
      const profile = profileEdge.node;
      const zoneCount = profile.profileLocationGroups.reduce((count, lg) => 
        count + lg.locationGroupZones.edges.length, 0
      );
      
      console.log(`Profile: "${profile.name}"`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  Default: ${profile.default}`);
      console.log(`  Zone Count: ${zoneCount}`);
      
      // If this looks like the General profile (has our 9 zones)
      if (profile.name === 'General profile' || zoneCount === 9) {
        console.log('  ✅ This appears to be our target profile!');
        console.log();
        console.log('  Zones in this profile:');
        
        for (const locationGroup of profile.profileLocationGroups) {
          for (const zoneEdge of locationGroup.locationGroupZones.edges) {
            const zone = zoneEdge.node.zone;
            console.log(`    - "${zone.name}" (${zone.id})`);
          }
        }
      }
      console.log();
    }
    
    // Now let's try to fetch by specific profile name
    console.log('='.repeat(60));
    console.log('TESTING PROFILE FILTERING');
    console.log('='.repeat(60));
    console.log();
    
    // Find the General profile
    const generalProfile = data.deliveryProfiles.edges.find(edge => 
      edge.node.name === 'General profile' || edge.node.default === true
    );
    
    if (generalProfile) {
      console.log('✅ Found General Profile:');
      console.log(`   Name: ${generalProfile.node.name}`);
      console.log(`   ID: ${generalProfile.node.id}`);
      console.log();
      
      const zones = [];
      for (const locationGroup of generalProfile.node.profileLocationGroups) {
        for (const zoneEdge of locationGroup.locationGroupZones.edges) {
          zones.push(zoneEdge.node.zone.name);
        }
      }
      
      console.log('   Zones to process:', zones.join(', '));
      console.log(`   Total: ${zones.length} zones`);
    } else {
      console.log('❌ Could not identify General Profile');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGeneralProfile();
