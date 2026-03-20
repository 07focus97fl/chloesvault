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
  type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'image', 'gif')),
  text TEXT,
  voice_url TEXT,
  media_url TEXT,
  duration INTEGER,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  pinned_at TIMESTAMPTZ,
  pinned_by TEXT CHECK (pinned_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to messages"
  ON chloesvault.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_messages_created_at ON chloesvault.messages(created_at);
CREATE INDEX idx_messages_pinned ON chloesvault.messages(is_pinned) WHERE is_pinned = true;

-- Full-text search on message text
ALTER TABLE chloesvault.messages ADD COLUMN text_search tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(text, ''))) STORED;
CREATE INDEX idx_messages_text_search ON chloesvault.messages USING GIN (text_search);

-- Quote Categories (user-creatable)
CREATE TABLE chloesvault.quote_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📝',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.quote_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to quote_categories"
  ON chloesvault.quote_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default categories
INSERT INTO chloesvault.quote_categories (value, label, emoji) VALUES
  ('racist', 'Racist Quote of the Month', '😬'),
  ('out_of_context', 'Out of Context', '🤨'),
  ('libtard', 'Libtard Quote of the Month', '🗳️');

-- Quotes (monthly quote game with categories)
CREATE TABLE chloesvault.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
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
  href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to activity"
  ON chloesvault.activity FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_activity_created_at ON chloesvault.activity(created_at);

-- Message Folders
CREATE TABLE chloesvault.message_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📁',
  created_by TEXT NOT NULL CHECK (created_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.message_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to message_folders"
  ON chloesvault.message_folders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Message Folder Items (junction table)
CREATE TABLE chloesvault.message_folder_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES chloesvault.message_folders(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES chloesvault.messages(id) ON DELETE CASCADE,
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(folder_id, message_id)
);

ALTER TABLE chloesvault.message_folder_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to message_folder_items"
  ON chloesvault.message_folder_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_folder_items_folder ON chloesvault.message_folder_items(folder_id);
CREATE INDEX idx_folder_items_message ON chloesvault.message_folder_items(message_id);

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

-- Message Notes (private notes on voice messages)
CREATE TABLE chloesvault.message_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chloesvault.messages(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.message_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to message_notes"
  ON chloesvault.message_notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_message_notes_message ON chloesvault.message_notes(message_id);
CREATE INDEX idx_message_notes_added_by ON chloesvault.message_notes(added_by);

-- Collage photos table
CREATE TABLE chloesvault.collage_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE chloesvault.collage_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to collage_photos"
  ON chloesvault.collage_photos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage bucket for collage photos
INSERT INTO storage.buckets (id, name, public) VALUES ('collage-photos', 'collage-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Anyone can upload collage photos"
  ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'collage-photos');
CREATE POLICY "Anyone can read collage photos"
  ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'collage-photos');
CREATE POLICY "Anyone can delete collage photos"
  ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'collage-photos');

-- Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Anyone can upload chat images"
  ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'chat-images');
CREATE POLICY "Anyone can read chat images"
  ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'chat-images');

-- Poems
CREATE TABLE chloesvault.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'free_verse',
  from_user TEXT NOT NULL CHECK (from_user IN ('michael', 'chloe')),
  to_user TEXT NOT NULL CHECK (to_user IN ('michael', 'chloe')),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to poems"
  ON chloesvault.poems FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_poems_date ON chloesvault.poems(date);

-- Icks
CREATE TABLE chloesvault.icks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  about TEXT NOT NULL CHECK (about IN ('michael', 'chloe')),
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.icks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to icks"
  ON chloesvault.icks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Vault notes (standalone notes, not tied to messages)
CREATE TABLE chloesvault.vault_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  added_by TEXT NOT NULL CHECK (added_by IN ('michael', 'chloe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.vault_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to vault_notes"
  ON chloesvault.vault_notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Push Subscriptions (for Web Push notifications)
CREATE TABLE chloesvault.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role TEXT NOT NULL CHECK (user_role IN ('michael', 'chloe')),
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  device_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chloesvault.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to push_subscriptions"
  ON chloesvault.push_subscriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_push_subscriptions_user ON chloesvault.push_subscriptions(user_role);

-- Message Reactions (iMessage-style tapback)
CREATE TABLE chloesvault.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chloesvault.messages(id) ON DELETE CASCADE,
  from_user TEXT NOT NULL CHECK (from_user IN ('michael', 'chloe')),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, from_user)
);

ALTER TABLE chloesvault.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to message_reactions"
  ON chloesvault.message_reactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_message_reactions_message ON chloesvault.message_reactions(message_id);

ALTER PUBLICATION supabase_realtime ADD TABLE chloesvault.message_reactions;
