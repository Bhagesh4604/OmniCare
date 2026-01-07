-- ============================================================================
-- MIGRATION: Add AI Verification Columns to emergencytrips Table
-- ============================================================================
-- Project: OmniCare HMS
-- Date: 2026-01-07
-- Purpose: Fix ambulance booking 500 error by adding missing columns
-- 
-- IMPORTANT: Run this SQL on your production database to fix the ambulance
--            booking error. These columns are required for the AI verification
--            feature.
-- ============================================================================

-- Step 1: Check if columns already exist (optional, for safety)
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'emergencytrips'
AND COLUMN_NAME IN ('trip_image_url', 'verification_status', 'verification_reason');

-- Step 2: Add missing columns
-- Note: If columns already exist, this will fail. That's OK - it means they're already there.

ALTER TABLE emergencytrips
ADD COLUMN trip_image_url VARCHAR(255) DEFAULT NULL COMMENT 'Path to uploaded accident image' AFTER notes;

ALTER TABLE emergencytrips
ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Pending' COMMENT 'AI verification result: Verified/Suspected Fake/Error/No Image/Pending' AFTER trip_image_url;

ALTER TABLE emergencytrips
ADD COLUMN verification_reason TEXT DEFAULT NULL COMMENT 'AI-generated explanation of verification decision' AFTER verification_status;

-- Step 3: Verify the columns were added successfully
DESCRIBE emergencytrips;

-- Step 4: Check existing data (should show NULL for new columns on old records)
SELECT 
    trip_id,
    status,
    patient_name,
    trip_image_url,
    verification_status,
    verification_reason
FROM emergencytrips
ORDER BY alert_timestamp DESC
LIMIT 5;

-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================
-- If you see the three new columns in the DESCRIBE output, migration is successful!
-- 
-- Next steps:
-- 1. Redeploy your backend code (if you made any changes)
-- 2. Test ambulance booking with and without images
-- 3. Check that AI verification is working
-- ============================================================================
