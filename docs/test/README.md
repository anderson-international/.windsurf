# API Testing Documentation

## Overview
This directory contains test files for validating the Shopify Shipping API endpoints.

## Test Files

### `api-endpoints-test.js`
Comprehensive test suite for all API endpoints using plain Node.js HTTP requests.

**Tests Included:**
- ✅ `GET /api/shipping-rates` - Fetch existing shipping rates
- ✅ `GET /api/zones` - Fetch shipping zones
- ✅ `POST /api/shipping-rates` (Valid Data) - Replace shipping rates
- ✅ `POST /api/shipping-rates` (Invalid Data) - Error handling validation

## Running Tests

### Prerequisites
1. Ensure your Next.js development server is running:
   ```bash
   npm run dev
   ```
   Server should be accessible at `http://localhost:3000`

2. Ensure your Shopify environment variables are configured:
   - `SHOPIFY_STORE_URL`
   - `SHOPIFY_ACCESS_TOKEN`
   - `SHOPIFY_API_VERSION`

### Execute Tests
```bash
# Navigate to project root
cd C:\Users\Jonny\Code\shopify-shipping

# Run the test suite
node docs\test\api-endpoints-test.js
```

## Test Output Format

### Success Example
```
✅ [2025-07-23T15:42:06.123Z] GET /api/shipping-rates: PASS
   Details: {
     "statusCode": 200,
     "dataCount": 5,
     "hasMetadata": true,
     "duration": "234ms",
     "sampleRate": {
       "id": "gid://shopify/DeliveryRateDefinition/123",
       "title": "Standard Shipping",
       "currency": "USD",
       "price": 9.99
     }
   }
```

### Failure Example
```
❌ [2025-07-23T15:42:06.456Z] POST /api/shipping-rates (Valid Data): FAIL
   Details: {
     "statusCode": 400,
     "body": {
       "success": false,
       "error": "Profile with ID gid://shopify/DeliveryProfile/1 not found"
     }
   }
```

## Expected Test Results

### Scenario 1: First Run (No Shopify Data)
- `GET /api/shipping-rates`: ✅ PASS (empty array)
- `GET /api/zones`: ✅ PASS (empty array)  
- `POST /api/shipping-rates`: ❌ FAIL (profile not found)

### Scenario 2: With Valid Shopify Store
- `GET /api/shipping-rates`: ✅ PASS (with data)
- `GET /api/zones`: ✅ PASS (with zones)
- `POST /api/shipping-rates` (Valid): ✅ PASS
- `POST /api/shipping-rates` (Invalid): ✅ PASS (correctly rejected)

## Test Data

### Sample Valid Rates
```javascript
[
  {
    "title": "Standard Shipping - Test",
    "zoneId": "gid://shopify/DeliveryZone/1", 
    "currency": "USD",
    "price": 9.99
  },
  {
    "title": "Express Shipping - Test",
    "zoneId": "gid://shopify/DeliveryZone/1",
    "currency": "USD", 
    "price": 19.99
  }
]
```

### Sample Invalid Data
```javascript
{
  "profileId": "",           // Empty profile ID
  "rates": "not-an-array"    // Invalid data type
}
```

## Troubleshooting

### Common Issues

**Connection Refused**
- Ensure Next.js dev server is running on port 3000
- Check `npm run dev` output for any startup errors

**Shopify API Errors**
- Verify environment variables are set correctly
- Check Shopify Admin API permissions
- Ensure API version is supported

**Test Failures**
- Review test output details for specific error messages
- Check server logs for additional context
- Validate sample data matches your Shopify store structure

### Debug Mode
Add console logging to track request/response flow:
```javascript
// Add this before makeRequest calls
console.log('Making request:', method, path, data);
```

## Exit Codes
- `0`: All tests passed
- `1`: One or more tests failed or encountered errors

## Integration with CI/CD
This test file can be integrated into automated testing pipelines:

```bash
# Example CI script
npm run dev &
sleep 5  # Wait for server startup
node docs/test/api-endpoints-test.js
kill %1  # Stop dev server
```
