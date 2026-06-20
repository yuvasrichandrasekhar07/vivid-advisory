-- Migration 002: Add Drive folder ID to land listings
ALTER TABLE land_listings ADD COLUMN drive_folder_id VARCHAR(255);
