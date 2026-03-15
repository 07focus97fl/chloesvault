-- Migration: drop old chloesvault tables and recreate with simplified auth
-- Run this in Supabase SQL Editor, then run schema.sql after

-- 1. Remove old tables from realtime (ignore errors if they aren't in the publication)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE chloesvault.messages;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE chloesvault.activity;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;

-- 2. Drop old tables (order matters due to foreign keys)
DROP TABLE IF EXISTS chloesvault.activity;
DROP TABLE IF EXISTS chloesvault.topics;
DROP TABLE IF EXISTS chloesvault.recommendations;
DROP TABLE IF EXISTS chloesvault.moments;
DROP TABLE IF EXISTS chloesvault.quotes;
DROP TABLE IF EXISTS chloesvault.messages;
DROP TABLE IF EXISTS chloesvault.profiles;

-- 3. Drop old storage bucket (Supabase protects direct deletes, so just delete the bucket if empty)
-- If the bucket has files, delete them via the Supabase Dashboard (Storage tab) first.
DO $$
BEGIN
  DELETE FROM storage.buckets WHERE id = 'voice-notes';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Drop the schema itself so schema.sql can start clean
DROP SCHEMA IF EXISTS chloesvault CASCADE;

-- Now run schema.sql
