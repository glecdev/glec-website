/**
 * Migration 005: Fix notices table ID default UUID generation
 *
 * Problem: The 'id' column in 'notices' table doesn't have DEFAULT gen_random_uuid()
 * This causes INSERT failures with "null value in column id violates not-null constraint"
 *
 * Root Cause:
 * - API INSERT statement doesn't specify 'id' column value
 * - Database expects auto-generation but no DEFAULT is set
 *
 * Solution:
 * - Add DEFAULT gen_random_uuid() to 'id' column
 * - Ensure pgcrypto extension is enabled for gen_random_uuid()
 */

-- Enable pgcrypto extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Check if notices table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'notices'
  ) THEN
    -- Alter the 'id' column to have DEFAULT gen_random_uuid()
    ALTER TABLE notices
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

    RAISE NOTICE 'SUCCESS: notices.id now has DEFAULT gen_random_uuid()';
  ELSE
    RAISE NOTICE 'WARNING: notices table does not exist - skipping';
  END IF;
END
$$;

-- Verify the change
DO $$
DECLARE
  default_value TEXT;
BEGIN
  SELECT column_default INTO default_value
  FROM information_schema.columns
  WHERE table_name = 'notices'
  AND column_name = 'id'
  AND table_schema = 'public';

  RAISE NOTICE 'Current notices.id default: %', COALESCE(default_value, 'NULL');
END
$$;
