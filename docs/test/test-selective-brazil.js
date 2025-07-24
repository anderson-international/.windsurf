// Test selective update of Brazil rate to £9.99 using new PATCH endpoint
require('dotenv').config({ path: '../../.env.local' });

async function testSelectiveBrazilUpdate() {
  console.log('🎯 Testing Selective Brazil Rate Update to £9.99...\n');

  try {
    // Step 1: Get current rates to find Brazil rate
    console.log('📡 Step 1: Fetching current rates...');
    const ratesResponse = await fetch('http://localhost:3000/api/shipping-rates');
    const ratesData = await ratesResponse.json();
    
    const brazilRates = ratesData.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    );
    
    console.log(`📊 Total rates before: ${ratesData.data.length}`);
    console.log(`🇧🇷 Brazil rates found: ${brazilRates.length}`);

    if (brazilRates.length === 0) {
      console.log('❌ No Brazil rates found');
      return;
    }

    const targetRate = brazilRates[0];
    console.log(`🎯 Target rate: "${targetRate.title}" - Current: £${targetRate.price}`);

    // Step 2: Use known profile ID from previous successful test
    const profileId = 'gid://shopify/DeliveryProfile/82268487887';
    console.log(`\n✅ Using Profile ID: ${profileId}`);

    // Step 3: Selective update using PATCH endpoint
    console.log('\n🚀 Step 3: Updating Brazil rate using PATCH /api/shipping-rates/update...');
    
    const updatePayload = {
      profileId: profileId,
      rates: [{
        id: targetRate.id,
        title: targetRate.title,
        profileName: targetRate.profileName,
        zoneId: targetRate.zoneId,
        zoneName: targetRate.zoneName,
        currency: targetRate.currency,
        price: 9.99
      }]
    };

    console.log('📦 Update Payload:', JSON.stringify(updatePayload, null, 2));

    const updateResponse = await fetch('http://localhost:3000/api/shipping-rates/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    const updateResult = await updateResponse.json();
    console.log(`\n📊 Update Response (${updateResponse.status}):`);
    console.log(JSON.stringify(updateResult, null, 2));

    // Step 4: Verify the results
    console.log('\n🔍 Step 4: Verifying selective update...');
    
    const afterResponse = await fetch('http://localhost:3000/api/shipping-rates');
    const afterData = await afterResponse.json();
    
    const afterBrazilRates = afterData.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    );

    console.log(`📊 Total rates after: ${afterData.data.length}`);
    console.log(`🇧🇷 Brazil rates after: ${afterBrazilRates.length}`);

    if (afterBrazilRates.length > 0) {
      const updatedRate = afterBrazilRates.find(rate => rate.price === 9.99);
      if (updatedRate) {
        console.log(`✅ SUCCESS: Brazil rate updated to £${updatedRate.price}!`);
        console.log(`   Rate ID: ${updatedRate.id}`);
        console.log(`   Title: ${updatedRate.title}`);
      } else {
        console.log('❌ FAILED: Could not find updated rate with £9.99');
        console.log('🇧🇷 Brazil rates found:', JSON.stringify(afterBrazilRates, null, 2));
      }
    }

    // Check if total rate count preserved
    if (ratesData.data.length === afterData.data.length) {
      console.log('✅ SUCCESS: Total rate count preserved (selective update worked!)');
    } else {
      console.log(`⚠️  Rate count changed: ${ratesData.data.length} → ${afterData.data.length}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSelectiveBrazilUpdate();
