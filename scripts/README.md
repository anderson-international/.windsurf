# Shopify Shipping Scripts

This directory contains utility scripts for managing the multi-carrier shipping integration with Shopify.

## Available Scripts

### Generate Rates

- **`generate-all-rates.js`**: Generate shipping rates for all carriers.
  ```
  node scripts/generate-all-rates.js
  ```

- **`generate-carrier-rates.js`**: Generate shipping rates for a specific carrier.
  ```
  node scripts/generate-carrier-rates.js [carrierId]
  ```
  Example:
  ```
  node scripts/generate-carrier-rates.js 1
  ```

### Deploy Rates

- **`deploy-shipping-rates.js`**: Deploy generated shipping rates to Shopify.
  ```
  node scripts/deploy-shipping-rates.js
  ```
  This script handles the full end-to-end deployment process:
  1. Fetches all available zones from Shopify
  2. Deploys appropriate rates to each zone
  3. Provides a deployment summary and success rate

### Debugging Tools

- **`shopify-zones-inspector.js`**: Debug GraphQL response structure from Shopify related to shipping zones.
  ```
  node scripts/shopify-zones-inspector.js
  ```
  Use this script when investigating issues with zone retrieval or structure.

## Usage Pattern

A typical workflow would be:

1. Generate rates for all carriers or a specific carrier
2. Deploy the generated rates to Shopify
3. Verify the rates in Shopify Admin (Settings → Shipping and delivery)

## Requirements

- The local development server must be running on `localhost:3000`
- Proper environment variables must be set in `.env` file
