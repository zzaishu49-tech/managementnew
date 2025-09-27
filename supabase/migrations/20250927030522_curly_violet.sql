/*
  # Add storage_path column to files table

  1. Changes
    - Add `storage_path` column to `files` table
    - Column is nullable TEXT type to store file paths in storage bucket
    - Used for private bucket file access and management

  2. Security
    - No changes to existing RLS policies
    - Column inherits same access controls as other file columns
*/

-- Add storage_path column to files table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE files ADD COLUMN storage_path TEXT;
  END IF;
END $$;