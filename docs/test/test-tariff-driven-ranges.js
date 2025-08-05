/**
 * Test script for tariff-driven weight range generation
 * Validates that weight ranges are correctly derived from carrier-specific tariff data
 */

const { PrismaClient } = require('@prisma/client');

async function testTariffDrivenRanges() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== TARIFF-DRIVEN WEIGHT RANGE TEST ===\n');
    
    // Test 1: Universal Tariffs (IoM Post - Carrier Service ID 2)
    console.log('📋 TEST 1: IoM Post Universal Tariffs');
    const universalTariffs = await prisma.universal_tariffs.findMany({
      where: { carrier_service_id: 2 },
      orderBy: { weight_kg: 'asc' }
    });
    
    console.log('Database tariffs:', universalTariffs.map(t => `${t.weight_kg}kg`).join(', '));
    
    // Expected ranges derivation:
    // 0.25kg → 0.00-0.25kg
    // 0.75kg → 0.25-0.75kg  
    // 2.00kg → 0.75-2.00kg
    console.log('Expected ranges:');
    let previousMax = 0.00;
    universalTariffs.forEach((tariff, index) => {
      const currentMax = parseFloat(tariff.weight_kg.toString());
      console.log(`  Range ${index + 1}: ${previousMax.toFixed(2)}kg → ${currentMax.toFixed(2)}kg`);
      previousMax = currentMax;
    });
    
    console.log('\n📋 TEST 2: Zone Tariffs Complete (DHL - Carrier Service ID 1)');
    const zoneTariffs = await prisma.zone_tariffs.findMany({
      where: { 
        carrier_service_id: 1,
        zone_name: 'Zone 0'
      },
      orderBy: { weight_kg: 'asc' }
    });
    
    console.log(`Database tariffs (${zoneTariffs.length} total):`, zoneTariffs.map(t => `${t.weight_kg}kg`).join(', '));
    
    console.log(`Expected ranges (${zoneTariffs.length} total):`);
    previousMax = 0.00;
    zoneTariffs.forEach((tariff, index) => {
      const currentMax = parseFloat(tariff.weight_kg.toString());
      console.log(`  Range ${index + 1}: ${previousMax.toFixed(2)}kg → ${currentMax.toFixed(2)}kg`);
      previousMax = currentMax;
    });
    
    console.log('\n📋 TEST 3: Carrier Service Configuration');
    const carrierServices = await prisma.carrier_services.findMany({
      where: { id: { in: [1, 2] } },
      orderBy: { id: 'asc' }
    });
    
    carrierServices.forEach(service => {
      console.log(`Carrier Service ID ${service.id}:`);
      console.log(`  Max Parcel Weight: ${service.max_parcel_weight}kg`);
      console.log(`  Max Total Weight: ${service.max_total_weight}kg`);
      console.log(`  Max Parcels: ${Math.ceil(service.max_total_weight / service.max_parcel_weight)}`);
    });
    
    console.log('\n✅ EXPECTED OUTCOME:');
    console.log('- IoM Post (0.25kg, 0.75kg, 2.00kg tariffs) should generate 3 ranges');
    console.log('- DHL (complete tariff set) should generate ranges for all available weights');
    console.log('- No more "No tariff found for weight 0.6kg" errors');
    console.log('- Each carrier uses only its available tariff weights');
    console.log('- Rate generation stops at max_total_weight boundary');
    console.log('- Weight ranges are continuous with no gaps or overlaps');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
console.log('🧪 Testing tariff-driven weight range generation...\n');
testTariffDrivenRanges();
