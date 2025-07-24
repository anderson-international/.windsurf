-- Verify generated rates count and sample data
SELECT 
  COUNT(*) as total_rates,
  COUNT(DISTINCT zone_name) as unique_zones,
  MIN(created_at) as first_generated,
  MAX(created_at) as last_generated
FROM generated_rates;

-- Sample of generated rates by zone
SELECT 
  zone_name,
  COUNT(*) as rates_count,
  MIN(price) as min_price,
  MAX(price) as max_price,
  AVG(price) as avg_price
FROM generated_rates 
GROUP BY zone_name 
ORDER BY zone_name 
LIMIT 10;
