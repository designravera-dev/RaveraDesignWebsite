-- Migration: Create products table for Ravera Catalog
-- This script ensures the table is created with the correct structure for the dynamic catalog.

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  image_src text NOT NULL,
  image_alt text,
  image_width integer,
  image_height integer,
  summary text,
  category text,
  material text,
  size text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (Allow everyone to see products)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
    END IF;
END $$;

-- Policy: Authenticated full access (Only admins can CRUD)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated full access') THEN
        CREATE POLICY "Allow authenticated full access" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
