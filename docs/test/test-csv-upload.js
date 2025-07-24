// Test CSV upload functionality
const fs = require('fs');
const path = require('path');

async function testCsvUpload() {
  console.log('📁 Testing CSV Upload...\n');

  try {
    // Step 1: Read sample CSV file
    const csvPath = path.join(__dirname, 'sample-rates.csv');
    console.log('📋 Step 1: Reading sample CSV...');
    
    if (!fs.existsSync(csvPath)) {
      console.log('❌ Sample CSV file not found:', csvPath);
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log('✅ CSV Content:');
    console.log(csvContent);
    console.log('');

    // Step 2: Prepare form data
    console.log('📦 Step 2: Preparing upload...');
    const profileId = 'gid://shopify/DeliveryProfile/82268487887';
    
    // Create FormData equivalent for Node.js
    const boundary = '----formdata-boundary-' + Math.random().toString(36);
    let formData = '';
    
    // Add profileId field
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="profileId"\r\n\r\n';
    formData += profileId + '\r\n';
    
    // Add file field
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="file"; filename="sample-rates.csv"\r\n';
    formData += 'Content-Type: text/csv\r\n\r\n';
    formData += csvContent + '\r\n';
    formData += `--${boundary}--\r\n`;

    console.log('✅ Form data prepared');

    // Step 3: Upload CSV
    console.log('\n🚀 Step 3: Uploading CSV...');
    
    const uploadResponse = await fetch('http://localhost:3000/api/shipping-rates/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    console.log(`📊 Upload Response (${uploadResponse.status}):`);
    console.log(JSON.stringify(uploadResult, null, 2));

    // Step 4: Verify upload results
    if (uploadResult.success) {
      console.log('\n🔍 Step 4: Verifying upload results...');
      
      const ratesResponse = await fetch('http://localhost:3000/api/shipping-rates');
      const ratesData = await ratesResponse.json();
      
      console.log(`📊 Total rates after upload: ${ratesData.data.length}`);
      
      // Check for uploaded rates
      const uploadedZones = ['brazil', 'united kingdom', 'united states', 'canada'];
      uploadedZones.forEach(zoneName => {
        const zoneRates = ratesData.data.filter(rate => 
          rate.zoneName && rate.zoneName.toLowerCase().includes(zoneName)
        );
        console.log(`   ${zoneName}: ${zoneRates.length} rates`);
      });
      
      console.log('\n✅ CSV upload test completed successfully!');
    } else {
      console.log('\n❌ CSV upload failed');
      if (uploadResult.data?.errorCsv) {
        console.log('\n📋 Error CSV:');
        console.log(uploadResult.data.errorCsv);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCsvUpload();
