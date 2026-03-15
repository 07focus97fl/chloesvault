-- ChloeVault Database Schema
-- All tables live in the "chloesvault" schema
-- Auth is a simple shared password on the client side, no Supabase auth.
-- User identity is stored as a role text ('michael' or 'chloe').

CREATE SCHEMA IF NOT EXISTS chloesvault;

-- Grant usage so Supabase/PostgREST can reach the schema
GRANT USAGE ON SCHEMA chloesvault TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA chloesvault
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA chloesvault
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- Messages
CREATE TABLE chloesvault.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user TEXT NOT NULL CHECK (from_user IN ('michael', 'chloe')),
  type TEXT NOT NULL CHECK (type IN ('text', 'voice')),
  text TEXT,
  voice_url TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to messages"
  ON chloesvault.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_messages_created_at ON chloesvault.messages(created_at);

-- Quotes (monthly quote game with categories)
CREATE TABLE chloesvault.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('racist', 'out_of_context', 'libtard')),
  month TEXT NOT NULL,  -- format: "March 2026"
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to quotes"
  ON chloesvault.quotes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_quotes_category_month ON chloesvault.quotes(category, month);
CREATE INDEX idx_quotes_month ON chloesvault.quotes(month);

-- Moments
CREATE TABLE chloesvault.moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to moments"
  ON chloesvault.moments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_moments_date ON chloesvault.moments(date);

-- Recommendations
CREATE TABLE chloesvault.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('movie', 'book', 'song', 'show', 'podcast', 'other')),
  from_user TEXT NOT NULL CHECK (from_user IN ('michael', 'chloe')),
  emoji TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to recommendations"
  ON chloesvault.recommendations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Topics
CREATE TABLE chloesvault.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to topics"
  ON chloesvault.topics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Activity
CREATE TABLE chloesvault.activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to activity"
  ON chloesvault.activity FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_activity_created_at ON chloesvault.activity(created_at);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chloesvault.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chloesvault.activity;

-- Expose the schema to PostgREST (required for Supabase client to query it)
-- Also add "chloesvault" in Supabase Dashboard: Settings > API > Exposed schemas
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, chloesvault';
NOTIFY pgrst, 'reload config';

-- Storage bucket for voice notes (uses anon access)
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can upload voice notes"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'voice-notes');

CREATE POLICY "Anyone can read voice notes"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'voice-notes');
