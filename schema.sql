-- ATX Teens Need Jobs - Supabase Database Schema

-- 1. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  logo TEXT,
  url TEXT,
  email TEXT,
  details TEXT[] DEFAULT '{}',
  perks TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer TEXT NOT NULL,
  reviewer_type TEXT NOT NULL, -- 'Student' or 'Business'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Stats Table
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Single row record
  businesses_partnered INTEGER DEFAULT 0,
  placements_completed INTEGER DEFAULT 0,
  jobs_posted INTEGER DEFAULT 0,
  internships_filled INTEGER DEFAULT 0
);

-- Populate initial stats row (matching current homepage stats)
INSERT INTO stats (id, businesses_partnered, placements_completed, jobs_posted, internships_filled)
VALUES (1, 32, 89, 450, 34)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Enable Public Access Policies (SELECT operations)
CREATE POLICY "Allow public select on jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public select on approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Allow public insert on reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on stats" ON stats FOR SELECT USING (true);

-- Enable Admin Access Policies (All operations for Authenticated users)
CREATE POLICY "Allow admin all on jobs" ON jobs TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all on reviews" ON reviews TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin update on stats" ON stats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4. Storage Bucket for Company Logos
-- Insert the public bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view logos
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'company-logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Allow admin upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'company-logos');

-- Allow authenticated users to update logos
CREATE POLICY "Allow admin update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'company-logos') WITH CHECK (bucket_id = 'company-logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Allow admin delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'company-logos');

