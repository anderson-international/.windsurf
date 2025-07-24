// Test selective update (PATCH) vs complete replacement (POST)
require('dotenv').config({ path: '../../.env.local' });

const BASE_URL = 'http://localhost:3000/api';

async function testSelectiveUpdate() {
  console.log('🔄 Testing Selective vs Complete Rate Updates...\n');

  try {
    // Step 1: Get current rates
    console.log('📡 Step 1: Getting current rates...');
    const ratesResponse = await fetch(`${BASE_URL}/shipping-rates`);
    const ratesData = await ratesResponse.json();
    
    const brazilRates = ratesData.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    );
    
    const allRatesCount = ratesData.data.length;
    console.log(`📊 Total rates: ${allRatesCount}`);
    console.log(`🇧🇷 Brazil rates: ${brazilRates.length}\n`);

    if (brazilRates.length === 0) {
      console.log('❌ No Brazil rates found. Please add some rates first.');
      return;
    }

    // Step 2: Test SELECTIVE UPDATE (PATCH)
    console.log('🎯 Step 2: Testing SELECTIVE UPDATE (PATCH /api/shipping-rates/update)...');
    
    const targetRate = brazilRates[0];
    const originalPrice = targetRate.price;
    const newPrice = 15.99;
    
    console.log(`   Updating rate "${targetRate.title}" from £${originalPrice} to £${newPrice}`);
    
    const updatePayload = {
      profileId: "gid://shopify/DeliveryProfile/82268487887", // Get this dynamically in real use
      rates: [{
        id: targetRate.id,
        title: targetRate.title,
        profileName: targetRate.profileName,
        zoneId: targetRate.zoneId,
        zoneName: targetRate.zoneName,
        currency: targetRate.currency,
        price: newPrice
      }]
    };

    const updateResponse = await fetch(`${BASE_URL}/shipping-rates/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    const updateResult = await updateResponse.json();
    console.log(`📊 Update Response (${updateResponse.status}):`, JSON.stringify(updateResult, null, 2));

    // Step 3: Verify selective update results
    console.log('\n🔍 Step 3: Verifying selective update results...');
    
    const afterUpdateResponse = await fetch(`${BASE_URL}/shipping-rates`);
    const afterUpdateData = await afterUpdateResponse.json();
    
    const afterUpdateCount = afterUpdateData.data.length;
    const afterBrazilRates = afterUpdateData.data.filter(rate => 
      rate.zoneName && rate.zoneName.toLowerCase().includes('brazil')
    );

    console.log(`📊 Total rates after selective update: ${afterUpdateCount}`);
    console.log(`🇧🇷 Brazil rates after selective update: ${afterBrazilRates.length}`);
    
    if (afterBrazilRates.length > 0) {
      const updatedRate = afterBrazilRates.find(rate => rate.price === newPrice);
      if (updatedRate) {
        console.log(`✅ SUCCESS: Found updated rate with price £${updatedRate.price}`);
      } else {
        console.log(`❌ FAILED: Could not find rate with updated price £${newPrice}`);
      }
    }

    // Step 4: Compare rate counts
    console.log('\n📈 Step 4: Comparing rate counts...');
    console.log(`   Before: ${allRatesCount} total rates`);
    console.log(`   After selective update: ${afterUpdateCount} total rates`);
    
    if (allRatesCount === afterUpdateCount) {
      console.log('✅ SUCCESS: Selective update preserved all other rates!');
    } else {
      console.log('❌ FAILED: Selective update affected other rates!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSelectiveUpdate();
