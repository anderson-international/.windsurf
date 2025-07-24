// Test true update behavior: create new + delete old
require('dotenv').config({ path: '../../.env.local' });

async function testTrueUpdate() {
  console.log('🔍 Testing True Update: Create New + Delete Old...\n');

  try {
    // Step 1: Get detailed BEFORE state
    console.log('📡 Step 1: Getting BEFORE state...');
    const beforeResponse = await fetch('http://localhost:3000/api/shipping-rates');
    const beforeData = await beforeResponse.json();
    
    const beforeBrazilRates = beforeData.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    );

    console.log(`📊 BEFORE: ${beforeData.data.length} total rates, ${beforeBrazilRates.length} Brazil rates`);
    console.log('🇧🇷 BEFORE Brazil rates:');
    beforeBrazilRates.forEach((rate, i) => {
      console.log(`   ${i+1}. ID: ${rate.id}`);
      console.log(`      Title: ${rate.title}`);
      console.log(`      Price: £${rate.price}`);
      console.log('');
    });

    if (beforeBrazilRates.length === 0) {
      console.log('❌ No Brazil rates found');
      return;
    }

    // Step 2: Find target rate to update
    const targetRate = beforeBrazilRates.find(rate => rate.price !== 9.99) || beforeBrazilRates[0];
    const originalPrice = targetRate.price;
    const newPrice = 9.99;
    
    console.log(`🎯 TARGET RATE TO UPDATE:`);
    console.log(`   ID: ${targetRate.id}`);
    console.log(`   Title: ${targetRate.title}`);
    console.log(`   Current Price: £${originalPrice} → £${newPrice}`);

    // Step 3: Perform selective update
    console.log('\n🚀 Step 3: Performing selective update...');
    
    const updatePayload = {
      profileId: "gid://shopify/DeliveryProfile/82268487887",
      rates: [{
        id: targetRate.id, // Existing ID - should trigger delete + create
        title: targetRate.title,
        profileName: targetRate.profileName,
        zoneId: targetRate.zoneId,
        zoneName: targetRate.zoneName,
        currency: targetRate.currency,
        price: newPrice
      }]
    };

    const updateResponse = await fetch('http://localhost:3000/api/shipping-rates/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    const updateResult = await updateResponse.json();
    console.log(`📊 Update Response (${updateResponse.status}):`, JSON.stringify(updateResult, null, 2));

    // Step 4: Get detailed AFTER state
    console.log('\n📡 Step 4: Getting AFTER state...');
    const afterResponse = await fetch('http://localhost:3000/api/shipping-rates');
    const afterData = await afterResponse.json();
    
    const afterBrazilRates = afterData.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    );

    console.log(`📊 AFTER: ${afterData.data.length} total rates, ${afterBrazilRates.length} Brazil rates`);
    console.log('🇧🇷 AFTER Brazil rates:');
    afterBrazilRates.forEach((rate, i) => {
      console.log(`   ${i+1}. ID: ${rate.id}`);
      console.log(`      Title: ${rate.title}`);
      console.log(`      Price: £${rate.price}`);
      console.log('');
    });

    // Step 5: Analysis
    console.log('🔍 Step 5: Analysis...');
    
    const targetIdStillExists = afterBrazilRates.some(rate => rate.id === targetRate.id);
    const newRateExists = afterBrazilRates.some(rate => rate.price === newPrice && rate.id !== targetRate.id);
    const sameIdUpdatedPrice = afterBrazilRates.some(rate => rate.id === targetRate.id && rate.price === newPrice);
    
    console.log(`   Original rate ID still exists: ${targetIdStillExists ? '❌ YES' : '✅ NO (deleted)'}`);
    console.log(`   New rate with updated price exists: ${newRateExists ? '✅ YES' : '❌ NO'}`);
    console.log(`   Same ID with updated price: ${sameIdUpdatedPrice ? '⚠️  YES (in-place update?)' : '✅ NO'}`);
    
    console.log(`\n📈 Rate count change: ${beforeData.data.length} → ${afterData.data.length} (${afterData.data.length - beforeData.data.length > 0 ? '+' : ''}${afterData.data.length - beforeData.data.length})`);
    console.log(`📈 Brazil rate count change: ${beforeBrazilRates.length} → ${afterBrazilRates.length} (${afterBrazilRates.length - beforeBrazilRates.length > 0 ? '+' : ''}${afterBrazilRates.length - beforeBrazilRates.length})`);

    // Determine what actually happened
    if (!targetIdStillExists && newRateExists) {
      console.log('\n✅ SUCCESS: True update worked! (Old deleted + New created)');
    } else if (targetIdStillExists && !newRateExists) {
      console.log('\n❌ FAILED: No update occurred');
    } else if (targetIdStillExists && newRateExists) {
      console.log('\n⚠️  PARTIAL: New rate created but old rate NOT deleted');
    } else if (sameIdUpdatedPrice) {
      console.log('\n🤔 UNEXPECTED: Same ID with updated price (in-place update?)');
    } else {
      console.log('\n❓ UNKNOWN: Unexpected behavior');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTrueUpdate();
