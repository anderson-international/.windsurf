require('dotenv').config()

async function debugContextResolution() {
  console.log('🔍 Debug: Testing Context Resolution Only...\n')
  
  try {
    const testZoneId = 'gid://shopify/DeliveryZone/302956380367'
    console.log(`📍 Testing context resolution for zone: ${testZoneId}`)
    
    // Import required classes
    const { ShopifyContextResolver } = require('../../services/shopify-context-resolver-core')
    
    const shopifyConfig = {
      storeUrl: process.env.SHOPIFY_STORE_URL,
      adminAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    }
    
    console.log('🔧 Shopify Config:')
    console.log(`   Store URL: ${shopifyConfig.storeUrl ? '✅ Set' : '❌ Missing'}`)
    console.log(`   Access Token: ${shopifyConfig.adminAccessToken ? '✅ Set' : '❌ Missing'}`)
    
    if (!shopifyConfig.storeUrl || !shopifyConfig.adminAccessToken) {
      throw new Error('Missing Shopify configuration - check environment variables')
    }
    
    console.log('\n📡 Attempting to resolve context...')
    const contextResolver = new ShopifyContextResolver(shopifyConfig)
    
    const startTime = Date.now()
    const context = await contextResolver.fetchShopifyContext(testZoneId)
    const duration = Date.now() - startTime
    
    console.log('✅ Context resolution successful!')
    console.log(`⏱️  Duration: ${duration}ms`)
    console.log('\n📋 Context Details:')
    console.log(`   Profile ID: ${context.profileId}`)
    console.log(`   Location Group ID: ${context.locationGroupId}`)
    console.log(`   Zone ID: ${context.zoneId}`)
    console.log(`   Existing Method Definitions: ${context.existingMethodDefinitionIds.length}`)
    
    if (context.existingMethodDefinitionIds.length > 0) {
      console.log('   Sample Method Definition IDs:')
      context.existingMethodDefinitionIds.slice(0, 3).forEach((id, index) => {
        console.log(`     ${index + 1}. ${id}`)
      })
      if (context.existingMethodDefinitionIds.length > 3) {
        console.log(`     ... and ${context.existingMethodDefinitionIds.length - 3} more`)
      }
    }
    
    console.log('\n🎉 Context resolution working perfectly!')
    console.log('✅ Our duplicate prevention fix data is available')
    
  } catch (error) {
    console.error('❌ Context resolution failed:', error.message)
    
    // Check if it's a throttling error
    if (error.message.includes('Throttled')) {
      console.log('\n💡 This is the Shopify API throttling issue')
      console.log('   Our single-zone approach should have avoided this!')
    }
    
    // Check if it's an authentication error
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n🔑 This appears to be an authentication issue')
      console.log('   Check your SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE_URL')
    }
    
    // Check if it's a 406 error
    if (error.message.includes('406')) {
      console.log('\n📄 HTTP 406 suggests content-type or request format issue')
      console.log('   This could be our GraphQL query format')
    }
  }
}

if (require.main === module) {
  debugContextResolution()
}

module.exports = { debugContextResolution }
