-- Migration: Add feed_type and keywords columns to feeds table
-- Run this in Supabase SQL Editor to add keyword-based feed support

-- Add feed_type column (default to 'url' for existing feeds)
ALTER TABLE feeds
ADD COLUMN IF NOT EXISTS feed_type TEXT DEFAULT 'url'
CHECK (feed_type IN ('url', 'keyword'));

-- Add keywords column for keyword-based feeds
ALTER TABLE feeds
ADD COLUMN IF NOT EXISTS keywords TEXT;

-- Update url column to allow empty string for keyword-based feeds
-- (url is still required for url-based feeds, enforced at app level)
