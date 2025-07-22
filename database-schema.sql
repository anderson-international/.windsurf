CREATE TYPE "RateType" AS ENUM (
  'FIXED',
  'PRICE_BASED', 
  'WEIGHT_BASED',
  'CALCULATED'
);

CREATE TABLE "delivery_profiles" (
  "id" SERIAL PRIMARY KEY,
  "shopify_id" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL
);

CREATE TABLE "profile_location_groups" (
  "id" SERIAL PRIMARY KEY,
  "shopify_id" VARCHAR(255) UNIQUE NOT NULL,
  "profile_id" INTEGER NOT NULL,
  
  CONSTRAINT "fk_profile_location_groups_profile_id" 
    FOREIGN KEY ("profile_id") 
    REFERENCES "delivery_profiles"("id") 
    ON DELETE CASCADE
);

CREATE TABLE "location_group_zones" (
  "id" SERIAL PRIMARY KEY,
  "shopify_id" VARCHAR(255) UNIQUE NOT NULL,
  "location_group_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "countries" TEXT[] NOT NULL,
  
  CONSTRAINT "fk_location_group_zones_location_group_id"
    FOREIGN KEY ("location_group_id") 
    REFERENCES "profile_location_groups"("id") 
    ON DELETE CASCADE
);

CREATE TABLE "shipping_rates" (
  "id" SERIAL PRIMARY KEY,
  "shopify_id" VARCHAR(255) UNIQUE NOT NULL,
  "zone_id" INTEGER NOT NULL,
  "handle" VARCHAR(255) UNIQUE NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "carrier_name" VARCHAR(255) NOT NULL,
  "rate_type" "RateType" NOT NULL DEFAULT 'FIXED',
  
  CONSTRAINT "fk_shipping_rates_zone_id"
    FOREIGN KEY ("zone_id") 
    REFERENCES "location_group_zones"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "idx_delivery_profiles_shopify_id" ON "delivery_profiles"("shopify_id");
CREATE INDEX "idx_profile_location_groups_shopify_id" ON "profile_location_groups"("shopify_id");
CREATE INDEX "idx_profile_location_groups_profile_id" ON "profile_location_groups"("profile_id");
CREATE INDEX "idx_location_group_zones_shopify_id" ON "location_group_zones"("shopify_id");
CREATE INDEX "idx_location_group_zones_location_group_id" ON "location_group_zones"("location_group_id");
CREATE INDEX "idx_shipping_rates_shopify_id" ON "shipping_rates"("shopify_id");
CREATE INDEX "idx_shipping_rates_zone_id" ON "shipping_rates"("zone_id");
CREATE INDEX "idx_shipping_rates_handle" ON "shipping_rates"("handle");
