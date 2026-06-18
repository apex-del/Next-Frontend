-- ============================================================
-- Complete Supabase Setup for okkupxjkocgasztfldak
-- Makes OKKUP the SINGLE source of truth (auth + data provider)
-- Replaces: FZR (data) + znh (old auth) + anime-stream-hub repo
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 0: Extensions & Helper Functions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PART 1: COMPLETE anime TABLE (merge FZR columns)
-- FZR has ~65+ columns OKKUP is missing.
-- OKKUP PK = mal_id (integer), FZR uses UUID id.
-- ============================================================

-- FZR-style columns (from live Death Note row)
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS kitsu_id INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS anidb_id INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS title_native TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS image_small TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS image_large TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS image_webp TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS image_webp_small TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS image_webp_large TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS cover_image_extra_large TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS cover_image_large TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS cover_image_medium TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS cover_color TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS status_anilist TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS episodes_aired INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS aired_from_year INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS aired_from_month INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS aired_from_day INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS aired_to_year INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS aired_to_month INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS aired_to_day INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS season_year INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS season_int INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS broadcast_day TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS broadcast_time TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS broadcast_timezone TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS broadcast_string TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS score_mean NUMERIC;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS score_avg NUMERIC;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS rank_score INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS rank_popularity INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS rank_score_context TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS rank_popularity_context TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS age_rating TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS age_rating_guide TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS nsfw BOOLEAN DEFAULT false;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS mal_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS anilist_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS auto_create_forum BOOLEAN DEFAULT false;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS synced_from TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS mal_last_updated TIMESTAMPTZ;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS anilist_last_updated TIMESTAMPTZ;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS trailer_youtube_id TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS trailer_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS trailer_embed_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS trailer_image_url TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS trailer_site TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS description_html TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS next_airing_time TIMESTAMPTZ;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS next_airing_in_seconds INTEGER;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- migration_v2.sql columns (sync-anime.ts depends on these)
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS hashtag TEXT;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS next_airing_episode JSONB;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS anilist_trends JSONB;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS approved BOOLEAN;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS explicit_genres TEXT[];
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS additional_images JSONB;
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS videos JSONB;

-- Full-text search vector
ALTER TABLE public.anime ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(title_english, '') || ' ' ||
      COALESCE(title_japanese, '') || ' ' ||
      COALESCE(title_native, '')
    )
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_anime_search_vector ON public.anime USING GIN (search_vector);

-- Indexes for anime
CREATE INDEX IF NOT EXISTS idx_anime_year ON public.anime(year);
CREATE INDEX IF NOT EXISTS idx_anime_season ON public.anime(season);
CREATE INDEX IF NOT EXISTS idx_anime_status ON public.anime(status);
CREATE INDEX IF NOT EXISTS idx_anime_type ON public.anime(type);
CREATE INDEX IF NOT EXISTS idx_anime_format ON public.anime(format);
CREATE INDEX IF NOT EXISTS idx_anime_score ON public.anime(score DESC);
CREATE INDEX IF NOT EXISTS idx_anime_popularity ON public.anime(popularity);
CREATE INDEX IF NOT EXISTS idx_anime_anilist_id ON public.anime(anilist_id);
CREATE INDEX IF NOT EXISTS idx_anime_trending ON public.anime(trending DESC);
CREATE INDEX IF NOT EXISTS idx_anime_airing ON public.anime(airing) WHERE airing = TRUE;
CREATE INDEX IF NOT EXISTS idx_anime_adult ON public.anime(is_adult) WHERE is_adult = FALSE;

-- RLS for anime
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime is viewable by everyone" ON public.anime;
CREATE POLICY "Anime is viewable by everyone" ON public.anime FOR SELECT USING (true);

-- ============================================================
-- PART 2: COMPLETE episodes TABLE (merge FZR columns)
-- ============================================================
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS mal_id INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS anilist_id INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS anime_mal_id INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS episode_number INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS episode_number_formatted TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS title_english TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS title_romanji TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS aired_date TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS aired_string TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS aired_timestamp BIGINT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS score NUMERIC(4,2);
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS forum_url TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS anilist_episode_id INTEGER;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS not_yet_aired BOOLEAN DEFAULT false;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS live_export BOOLEAN DEFAULT false;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON public.episodes(anime_id);
CREATE INDEX IF NOT EXISTS idx_episodes_number ON public.episodes(anime_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_episodes_mal_id ON public.episodes(mal_id);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Episodes are viewable by everyone" ON public.episodes;
CREATE POLICY "Episodes are viewable by everyone" ON public.episodes FOR SELECT USING (true);

-- ============================================================
-- PART 3: COMPLETE USER TABLES (from GitHub repo + schema.sql)
-- ============================================================

-- 3a. PROFILES (extend with schema.sql columns)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (public_profile = TRUE OR auth.uid() = user_id);

-- 3b. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3c. FAVORITES (already complete)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Favorites are viewable by everyone" ON public.favorites;
CREATE POLICY "Favorites are viewable by everyone"
  ON public.favorites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
CREATE POLICY "Users can update own favorites"
  ON public.favorites FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);
GRANT SELECT ON public.favorites TO anon;

-- 3d. WATCH HISTORY (add created_at if missing)
ALTER TABLE public.watch_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.watch_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

DROP TRIGGER IF EXISTS update_watch_history_updated_at ON public.watch_history;
CREATE TRIGGER update_watch_history_updated_at
  BEFORE UPDATE ON public.watch_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_watch_history_recent ON public.watch_history(user_id, watched_at DESC);

-- 3e. COMMENTS (extend with schema.sql columns)
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS episode_number INTEGER;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_spoiler BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- 3f. COMMENT REACTIONS (already complete per GitHub repo)

-- 3g. ANIME STATUS (extend with schema.sql columns)
ALTER TABLE public.anime_status ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 10);
ALTER TABLE public.anime_status ADD COLUMN IF NOT EXISTS episodes_watched INTEGER DEFAULT 0;
ALTER TABLE public.anime_status ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.anime_status ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 3h. FOLLOWS (already complete)

-- 3i. REPORTS (extend with schema.sql columns)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 3j. NOTIFICATIONS (new table)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 3k. USER LISTS (new table - custom anime lists)
CREATE TABLE IF NOT EXISTS public.user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public lists are viewable by everyone" ON public.user_lists;
CREATE POLICY "Public lists are viewable by everyone"
  ON public.user_lists FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own lists" ON public.user_lists;
CREATE POLICY "Users can manage their own lists"
  ON public.user_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own lists" ON public.user_lists;
CREATE POLICY "Users can update their own lists"
  ON public.user_lists FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.user_lists;
CREATE POLICY "Users can delete their own lists"
  ON public.user_lists FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lists TO authenticated;
GRANT ALL ON public.user_lists TO service_role;

DROP TRIGGER IF EXISTS update_user_lists_updated_at ON public.user_lists;
CREATE TRIGGER update_user_lists_updated_at
  BEFORE UPDATE ON public.user_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_list_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  note TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (list_id, anime_id)
);

ALTER TABLE public.user_list_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "List entries inherit list visibility" ON public.user_list_entries;
CREATE POLICY "List entries inherit list visibility"
  ON public.user_list_entries FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_lists WHERE id = list_id AND (is_public = TRUE OR auth.uid() = user_id))
  );
DROP POLICY IF EXISTS "Users can manage their list entries" ON public.user_list_entries;
CREATE POLICY "Users can manage their list entries"
  ON public.user_list_entries FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_lists WHERE id = list_id AND auth.uid() = user_id)
  );
DROP POLICY IF EXISTS "Users can delete their list entries" ON public.user_list_entries;
CREATE POLICY "Users can delete their list entries"
  ON public.user_list_entries FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_lists WHERE id = list_id AND auth.uid() = user_id)
  );

GRANT SELECT, INSERT, DELETE ON public.user_list_entries TO authenticated;
GRANT ALL ON public.user_list_entries TO service_role;

-- ============================================================
-- PART 4: STREAMING TABLES (from FZR + schema.sql)
-- ============================================================

-- 4a. STREAMING URLS (embed links)
CREATE TABLE IF NOT EXISTS public.streaming_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mal_id INTEGER NOT NULL,
  anime_slug TEXT,
  anime_name TEXT,
  episode_number INTEGER NOT NULL,
  quality TEXT DEFAULT '360p',
  category TEXT NOT NULL DEFAULT 'sub' CHECK (category IN ('sub', 'dub', 'cc')),
  service_name TEXT NOT NULL,
  service_url TEXT,
  embed_url TEXT NOT NULL,
  link_type TEXT DEFAULT 'embed',
  iframe_url TEXT,
  iframe_src TEXT,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mal_id, episode_number, quality, category, service_name)
);

ALTER TABLE public.streaming_urls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Streaming URLs are viewable by everyone" ON public.streaming_urls;
CREATE POLICY "Streaming URLs are viewable by everyone" ON public.streaming_urls FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_streaming_urls_lookup ON public.streaming_urls(mal_id, episode_number, category);
CREATE INDEX IF NOT EXISTS idx_streaming_urls_active ON public.streaming_urls(mal_id, episode_number, category, quality, is_active);

GRANT SELECT ON public.streaming_urls TO anon;
GRANT SELECT ON public.streaming_urls TO authenticated;
GRANT ALL ON public.streaming_urls TO service_role;

-- 4b. UPLOADS (download links from pipeline)
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mal_id INTEGER NOT NULL,
  anime_slug TEXT,
  anime_name TEXT,
  episode_number INTEGER NOT NULL,
  quality TEXT NOT NULL DEFAULT 'all',
  category TEXT DEFAULT 'cc' CHECK (category IN ('sub', 'dub', 'cc')),
  service_name TEXT NOT NULL,
  service_url TEXT NOT NULL,
  link_type TEXT DEFAULT 'download',
  status TEXT DEFAULT 'completed',
  service_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Uploads are viewable by everyone" ON public.uploads;
CREATE POLICY "Uploads are viewable by everyone" ON public.uploads FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_uploads_lookup ON public.uploads(mal_id, episode_number);
GRANT SELECT ON public.uploads TO anon;
GRANT SELECT ON public.uploads TO authenticated;
GRANT ALL ON public.uploads TO service_role;

-- 4b2. DOWNLOAD LINKS (schema.sql - MAL download links)
CREATE TABLE IF NOT EXISTS public.download_links (
  id SERIAL PRIMARY KEY,
  mal_id INTEGER NOT NULL,
  anime_id INTEGER REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  quality TEXT DEFAULT '360p',
  category TEXT NOT NULL DEFAULT 'sub' CHECK (category IN ('sub', 'dub')),
  service_name TEXT NOT NULL,
  service_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mal_id, episode_number, quality, category, service_name)
);

ALTER TABLE public.download_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Download links are viewable by everyone" ON public.download_links;
CREATE POLICY "Download links are viewable by everyone" ON public.download_links FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_download_links_lookup ON public.download_links(mal_id, episode_number, category);
GRANT SELECT ON public.download_links TO anon, authenticated;
GRANT ALL ON public.download_links TO service_role;

-- 4b3. VIDEO UPLOADS (schema.sql - pipeline encoded videos)
CREATE TABLE IF NOT EXISTS public.video_uploads (
  id SERIAL PRIMARY KEY,
  mal_id INTEGER,
  anime_id INTEGER REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  quality TEXT NOT NULL,
  category TEXT DEFAULT 'sub',
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_secs INTEGER,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.video_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Video uploads are viewable by everyone" ON public.video_uploads;
CREATE POLICY "Video uploads are viewable by everyone" ON public.video_uploads FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_video_uploads_lookup ON public.video_uploads(mal_id, episode_number, quality, category);
GRANT SELECT ON public.video_uploads TO anon, authenticated;
GRANT ALL ON public.video_uploads TO service_role;

-- 4c. SHORTENED URLS (monetization short links)
CREATE TABLE IF NOT EXISTS public.shortened_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES public.uploads(id) ON DELETE SET NULL,
  mal_id INTEGER NOT NULL,
  anime_slug TEXT,
  anime_name TEXT,
  episode_number INTEGER NOT NULL,
  quality TEXT DEFAULT '360p',
  category TEXT DEFAULT 'sub' CHECK (category IN ('sub', 'dub', 'cc')),
  service_name TEXT NOT NULL,
  original_url TEXT NOT NULL,
  short_url TEXT NOT NULL,
  short_service TEXT NOT NULL,
  short_alias TEXT,
  link_type TEXT DEFAULT 'both',
  status TEXT DEFAULT 'completed',
  error TEXT,
  attempts INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Shortened URLs are viewable by everyone" ON public.shortened_urls;
CREATE POLICY "Shortened URLs are viewable by everyone" ON public.shortened_urls FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_shortened_urls_lookup ON public.shortened_urls(mal_id, episode_number);
GRANT SELECT ON public.shortened_urls TO anon;
GRANT SELECT ON public.shortened_urls TO authenticated;
GRANT ALL ON public.shortened_urls TO service_role;

-- 4c2. SHORT LINKS (schema.sql version)
CREATE TABLE IF NOT EXISTS public.short_links (
  id SERIAL PRIMARY KEY,
  mal_id INTEGER NOT NULL,
  anime_id INTEGER REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  quality TEXT DEFAULT '360p',
  category TEXT NOT NULL DEFAULT 'sub' CHECK (category IN ('sub', 'dub')),
  service_name TEXT NOT NULL,
  short_url TEXT NOT NULL,
  short_service TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mal_id, episode_number, quality, category, short_service)
);

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Short links are viewable by everyone" ON public.short_links;
CREATE POLICY "Short links are viewable by everyone" ON public.short_links FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_short_links_lookup ON public.short_links(mal_id, episode_number, category);
GRANT SELECT ON public.short_links TO anon, authenticated;
GRANT ALL ON public.short_links TO service_role;

-- 4d. SUBTITLES
CREATE TABLE IF NOT EXISTS public.subtitles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER,
  mal_id INTEGER,
  episode_number INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'eng',
  url TEXT NOT NULL,
  is_translated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mal_id, episode_number, language)
);

ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subtitles are viewable by everyone" ON public.subtitles;
CREATE POLICY "Subtitles are viewable by everyone" ON public.subtitles FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_subtitles_lookup ON public.subtitles(mal_id, episode_number);
GRANT SELECT ON public.subtitles TO anon;
GRANT SELECT ON public.subtitles TO authenticated;
GRANT ALL ON public.subtitles TO service_role;

-- ============================================================
-- PART 5: CONTENT TABLES (tags, recommendations, etc.)
-- ============================================================

-- 5a. TAGS (AniList content tags)
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  anilist_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  rank INTEGER DEFAULT 0,
  is_general_sfw BOOLEAN DEFAULT true,
  is_media_child_friendly BOOLEAN DEFAULT false,
  is_adult BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT ALL ON public.tags TO service_role;

CREATE TABLE IF NOT EXISTS public.anime_tags (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  rank INTEGER DEFAULT 0,
  is_general_spoiler BOOLEAN DEFAULT false,
  is_media_spoiler BOOLEAN DEFAULT false,
  PRIMARY KEY (anime_id, tag_id)
);

ALTER TABLE public.anime_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime tags are viewable by everyone" ON public.anime_tags;
CREATE POLICY "Anime tags are viewable by everyone" ON public.anime_tags FOR SELECT USING (true);
GRANT SELECT ON public.anime_tags TO anon, authenticated;
GRANT ALL ON public.anime_tags TO service_role;

-- 5b. EXTERNAL LINKS
CREATE TABLE IF NOT EXISTS public.anime_external_links (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  url TEXT,
  site TEXT NOT NULL,
  site_id INTEGER,
  link_type TEXT,
  language TEXT,
  color TEXT,
  icon TEXT,
  notes TEXT,
  is_disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_external_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "External links are viewable by everyone" ON public.anime_external_links;
CREATE POLICY "External links are viewable by everyone" ON public.anime_external_links FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_external_links_anime_id ON public.anime_external_links(anime_id);
GRANT SELECT ON public.anime_external_links TO anon, authenticated;
GRANT ALL ON public.anime_external_links TO service_role;

-- 5c. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.anime_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  recommended_mal_id INTEGER NOT NULL,
  recommended_title TEXT,
  recommended_image TEXT,
  votes INTEGER DEFAULT 0,
  source TEXT DEFAULT 'jikan',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (anime_id, recommended_mal_id)
);

ALTER TABLE public.anime_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recommendations are viewable by everyone" ON public.anime_recommendations;
CREATE POLICY "Recommendations are viewable by everyone" ON public.anime_recommendations FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_recommendations_anime_id ON public.anime_recommendations(anime_id);
GRANT SELECT ON public.anime_recommendations TO anon, authenticated;
GRANT ALL ON public.anime_recommendations TO service_role;

-- 5c2. RECOMMENDATIONS (migration.sql - sync-anime.ts writes here)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  recommended_mal_id INTEGER NOT NULL,
  recommended_title TEXT,
  recommended_image TEXT,
  votes INTEGER DEFAULT 0,
  source TEXT DEFAULT 'jikan',
  UNIQUE (anime_id, recommended_mal_id)
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recommendations are viewable by everyone" ON public.recommendations;
CREATE POLICY "Recommendations are viewable by everyone" ON public.recommendations FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_recommendations_anime_id ON public.recommendations(anime_id);
GRANT SELECT ON public.recommendations TO anon, authenticated;
GRANT ALL ON public.recommendations TO service_role;

-- 5d. AIRING SCHEDULE
CREATE TABLE IF NOT EXISTS public.anime_airing_schedule (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  anilist_id INTEGER UNIQUE,
  episode INTEGER NOT NULL,
  airing_at BIGINT NOT NULL,
  time_until_airing INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_airing_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Airing schedule is viewable by everyone" ON public.anime_airing_schedule;
CREATE POLICY "Airing schedule is viewable by everyone" ON public.anime_airing_schedule FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_airing_schedule_anime_id ON public.anime_airing_schedule(anime_id);
CREATE INDEX IF NOT EXISTS idx_anime_airing_schedule_airing_at ON public.anime_airing_schedule(airing_at);
GRANT SELECT ON public.anime_airing_schedule TO anon, authenticated;
GRANT ALL ON public.anime_airing_schedule TO service_role;

-- 5e. SYNC LOG
CREATE TABLE IF NOT EXISTS public.sync_log (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER REFERENCES public.anime(mal_id) ON DELETE SET NULL,
  anilist_id INTEGER,
  mal_id INTEGER,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_anime_id ON public.sync_log(anime_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON public.sync_log(created_at);
GRANT ALL ON public.sync_log TO service_role;

-- ============================================================
-- PART 6: EXISTING MIGRATION TABLES (v2 + v3)
-- ============================================================

-- 6a. ANIME SONGS (from migration_v2.sql)
CREATE TABLE IF NOT EXISTS public.anime_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('opening', 'ending')),
  text TEXT NOT NULL,
  episodes TEXT,
  index INTEGER DEFAULT 1,
  UNIQUE (anime_id, type, index)
);

ALTER TABLE public.anime_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime songs are viewable by everyone" ON public.anime_songs;
CREATE POLICY "Anime songs are viewable by everyone" ON public.anime_songs FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_songs_anime_id ON public.anime_songs(anime_id);
GRANT SELECT ON public.anime_songs TO anon, authenticated;

-- 6b. ANIME VIDEOS (from migration_v2.sql)
CREATE TABLE IF NOT EXISTS public.anime_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  title TEXT,
  episode TEXT,
  image_url TEXT,
  embed_url TEXT,
  video_type TEXT DEFAULT 'episode_preview',
  UNIQUE (anime_id, title)
);

ALTER TABLE public.anime_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime videos are viewable by everyone" ON public.anime_videos;
CREATE POLICY "Anime videos are viewable by everyone" ON public.anime_videos FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_videos_anime_id ON public.anime_videos(anime_id);
GRANT SELECT ON public.anime_videos TO anon, authenticated;

-- 6c. ANIME RANKINGS (from migration_v2.sql)
CREATE TABLE IF NOT EXISTS public.anime_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  type TEXT NOT NULL,
  format TEXT,
  year INTEGER,
  season TEXT,
  all_time BOOLEAN DEFAULT false,
  context TEXT,
  UNIQUE (anime_id, type, year, season)
);

ALTER TABLE public.anime_rankings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime rankings are viewable by everyone" ON public.anime_rankings;
CREATE POLICY "Anime rankings are viewable by everyone" ON public.anime_rankings FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_rankings_anime_id ON public.anime_rankings(anime_id);
GRANT SELECT ON public.anime_rankings TO anon, authenticated;

-- 6d. CHARACTERS (base + extend from migration.sql + schema.sql)
CREATE TABLE IF NOT EXISTS public.characters (
  mal_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_kanji TEXT,
  about TEXT,
  favorites INTEGER DEFAULT 0,
  image_url TEXT,
  image_url_jpg TEXT,
  url TEXT
);
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS anilist_id INTEGER UNIQUE;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS name_full TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS name_first TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS name_last TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS name_native TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS name_alternative JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS image_large TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS image_medium TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS image_jsonb JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS date_of_birth_year INTEGER;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS date_of_birth_month INTEGER;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS date_of_birth_day INTEGER;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS mal_url TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS favourites INTEGER;

CREATE INDEX IF NOT EXISTS idx_characters_name ON public.characters(name);
CREATE INDEX IF NOT EXISTS idx_characters_name_full ON public.characters USING gin (name_full gin_trgm_ops);

-- 6e. STAFF (base + extend from migration.sql + schema.sql)
CREATE TABLE IF NOT EXISTS public.staff (
  mal_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  image_url_webp TEXT,
  url TEXT
);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS anilist_id INTEGER UNIQUE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS given_name TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS family_name TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name_full TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name_first TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name_last TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name_native TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name_alternative JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS alternate_names TEXT[];
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS image_large TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS image_medium TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS image_jsonb JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS image_url_webp TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS favourites INTEGER DEFAULT 0;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_staff_name ON public.staff USING gin (name_full gin_trgm_ops);

-- 6f. ANIME STAFF junction (from migration.sql)
CREATE TABLE IF NOT EXISTS public.anime_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  staff_id INTEGER NOT NULL REFERENCES public.staff(mal_id) ON DELETE CASCADE,
  role TEXT,
  positions TEXT[],
  sort_order INTEGER,
  UNIQUE (anime_id, staff_id)
);

ALTER TABLE public.anime_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime staff are viewable by everyone" ON public.anime_staff;
CREATE POLICY "Anime staff are viewable by everyone" ON public.anime_staff FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_staff_anime_id ON public.anime_staff(anime_id);
GRANT SELECT ON public.anime_staff TO anon, authenticated;

-- 6g. ANIME CHARACTERS (extend from migration.sql)
ALTER TABLE public.anime_characters ADD COLUMN IF NOT EXISTS character_id INTEGER;
ALTER TABLE public.anime_characters ADD COLUMN IF NOT EXISTS voice_actor_id INTEGER;
ALTER TABLE public.anime_characters ADD COLUMN IF NOT EXISTS sort_order INTEGER;
ALTER TABLE public.anime_characters ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- 6h. VOICE ACTORS (from migration.sql)
CREATE TABLE IF NOT EXISTS public.voice_actors (
  mal_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  image_url_webp TEXT,
  url TEXT,
  language TEXT DEFAULT 'Japanese'
);

ALTER TABLE public.voice_actors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voice actors are viewable by everyone" ON public.voice_actors;
CREATE POLICY "Voice actors are viewable by everyone" ON public.voice_actors FOR SELECT USING (true);
GRANT SELECT ON public.voice_actors TO anon, authenticated;

-- 6i. ANIME GENRES (ensure exists)
CREATE TABLE IF NOT EXISTS public.anime_genres (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  is_explicit BOOLEAN DEFAULT false,
  is_themed BOOLEAN DEFAULT false,
  PRIMARY KEY (anime_id, genre_id)
);

ALTER TABLE public.anime_genres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime genres are viewable by everyone" ON public.anime_genres;
CREATE POLICY "Anime genres are viewable by everyone" ON public.anime_genres FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_genres_anime_id ON public.anime_genres(anime_id);
GRANT SELECT ON public.anime_genres TO anon, authenticated;

-- 6j. ANIME STUDIOS (ensure exists)
CREATE TABLE IF NOT EXISTS public.anime_studios (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  studio_id INTEGER NOT NULL REFERENCES public.studios(mal_id) ON DELETE CASCADE,
  is_main BOOLEAN DEFAULT false,
  PRIMARY KEY (anime_id, studio_id)
);

ALTER TABLE public.anime_studios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime studios are viewable by everyone" ON public.anime_studios;
CREATE POLICY "Anime studios are viewable by everyone" ON public.anime_studios FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_studios_anime_id ON public.anime_studios(anime_id);
GRANT SELECT ON public.anime_studios TO anon, authenticated;

-- 6k. STUDIOS (base + extend from migration.sql)
CREATE TABLE IF NOT EXISTS public.studios (
  mal_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS anilist_id INTEGER UNIQUE;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS is_animation_studio BOOLEAN DEFAULT true;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 6l. GENRES (base + extend for anilist type)
CREATE TABLE IF NOT EXISTS public.genres (
  mal_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
ALTER TABLE public.genres ADD COLUMN IF NOT EXISTS anilist_type TEXT;

-- 6m. PRODUCERS (base + extend from migration.sql)
CREATE TABLE IF NOT EXISTS public.producers (
  mal_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT
);
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'producer';
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 6n. DEMOGRAPHICS (ensure exists with proper structure)
CREATE TABLE IF NOT EXISTS public.demographics (
  id SERIAL PRIMARY KEY,
  mal_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demographics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Demographics are viewable by everyone" ON public.demographics;
CREATE POLICY "Demographics are viewable by everyone" ON public.demographics FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.anime_demographics (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  demographic_id INTEGER NOT NULL REFERENCES public.demographics(id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, demographic_id)
);

ALTER TABLE public.anime_demographics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime demographics are viewable by everyone" ON public.anime_demographics;
CREATE POLICY "Anime demographics are viewable by everyone" ON public.anime_demographics FOR SELECT USING (true);

-- 6n2. LICENSORS (MAL)
CREATE TABLE IF NOT EXISTS public.licensors (
  id SERIAL PRIMARY KEY,
  mal_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.licensors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Licensors are viewable by everyone" ON public.licensors;
CREATE POLICY "Licensors are viewable by everyone" ON public.licensors FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.anime_licensors (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  licensor_id INTEGER NOT NULL REFERENCES public.licensors(id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, licensor_id)
);

ALTER TABLE public.anime_licensors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime licensors are viewable by everyone" ON public.anime_licensors;
CREATE POLICY "Anime licensors are viewable by everyone" ON public.anime_licensors FOR SELECT USING (true);
GRANT SELECT ON public.licensors, public.anime_licensors TO anon, authenticated;
GRANT ALL ON public.licensors, public.anime_licensors TO service_role;

-- 6n3. STREAMING LINKS (MAL)
CREATE TABLE IF NOT EXISTS public.anime_streaming_links (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  name TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_streaming_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Streaming links are viewable by everyone" ON public.anime_streaming_links;
CREATE POLICY "Streaming links are viewable by everyone" ON public.anime_streaming_links FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_streaming_links_anime_id ON public.anime_streaming_links(anime_id);
GRANT SELECT ON public.anime_streaming_links TO anon, authenticated;
GRANT ALL ON public.anime_streaming_links TO service_role;

-- 6n4. STREAMING EPISODES (AniList)
CREATE TABLE IF NOT EXISTS public.anime_streaming_episodes (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  title TEXT,
  thumbnail TEXT,
  url TEXT,
  site TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_streaming_episodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Streaming episodes are viewable by everyone" ON public.anime_streaming_episodes;
CREATE POLICY "Streaming episodes are viewable by everyone" ON public.anime_streaming_episodes FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_streaming_eps_anime_id ON public.anime_streaming_episodes(anime_id);
GRANT SELECT ON public.anime_streaming_episodes TO anon, authenticated;
GRANT ALL ON public.anime_streaming_episodes TO service_role;

-- 6o. THEMES
CREATE TABLE IF NOT EXISTS public.themes (
  id SERIAL PRIMARY KEY,
  mal_id INTEGER UNIQUE,
  name TEXT NOT NULL
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Themes are viewable by everyone" ON public.themes;
CREATE POLICY "Themes are viewable by everyone" ON public.themes FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.anime_themes (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  theme_id INTEGER NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, theme_id)
);

ALTER TABLE public.anime_themes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime themes are viewable by everyone" ON public.anime_themes;
CREATE POLICY "Anime themes are viewable by everyone" ON public.anime_themes FOR SELECT USING (true);

-- 6p. ANIME REVIEWS (from migration.sql)
CREATE TABLE IF NOT EXISTS public.anime_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  mal_review_id INTEGER UNIQUE,
  user_name TEXT,
  score INTEGER,
  review TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime reviews are viewable by everyone" ON public.anime_reviews;
CREATE POLICY "Anime reviews are viewable by everyone" ON public.anime_reviews FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_reviews_anime_id ON public.anime_reviews(anime_id);
GRANT SELECT ON public.anime_reviews TO anon, authenticated;

-- 6q. ANIME STATISTICS (from migration.sql)
CREATE TABLE IF NOT EXISTS public.anime_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  watching INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  on_hold INTEGER DEFAULT 0,
  dropped INTEGER DEFAULT 0,
  plan_to_watch INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  scores JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (anime_id)
);

ALTER TABLE public.anime_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime statistics are viewable by everyone" ON public.anime_statistics;
CREATE POLICY "Anime statistics are viewable by everyone" ON public.anime_statistics FOR SELECT USING (true);
GRANT SELECT ON public.anime_statistics TO anon, authenticated;

-- 6r. ANIME RELATIONS (from migration_v3.sql - sync-anime.ts writes here)
CREATE TABLE IF NOT EXISTS public.anime_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  related_mal_id INTEGER NOT NULL,
  related_title TEXT,
  related_type TEXT,
  related_image TEXT,
  UNIQUE (anime_id, relation_type, related_mal_id)
);

ALTER TABLE public.anime_relations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime relations are viewable by everyone" ON public.anime_relations;
CREATE POLICY "Anime relations are viewable by everyone" ON public.anime_relations FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_relations_anime_id ON public.anime_relations(anime_id);
GRANT SELECT ON public.anime_relations TO anon, authenticated;
GRANT ALL ON public.anime_relations TO service_role;

-- 6s. ANIME PRODUCERS junction (from migration.sql)
CREATE TABLE IF NOT EXISTS public.anime_producers (
  anime_id INTEGER NOT NULL REFERENCES public.anime(mal_id) ON DELETE CASCADE,
  producer_id INTEGER NOT NULL REFERENCES public.producers(mal_id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, producer_id)
);

ALTER TABLE public.anime_producers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime producers are viewable by everyone" ON public.anime_producers;
CREATE POLICY "Anime producers are viewable by everyone" ON public.anime_producers FOR SELECT USING (true);
GRANT SELECT ON public.anime_producers TO anon, authenticated;
GRANT ALL ON public.anime_producers TO service_role;

-- 6t. CHARACTER VOICE ACTORS junction (from migration_v3.sql)
CREATE TABLE IF NOT EXISTS public.character_voice_actors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES public.characters(mal_id) ON DELETE CASCADE,
  voice_actor_id INTEGER NOT NULL REFERENCES public.voice_actors(mal_id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'Japanese',
  UNIQUE (character_id, voice_actor_id, language)
);

ALTER TABLE public.character_voice_actors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Character voice actors are viewable by everyone" ON public.character_voice_actors;
CREATE POLICY "Character voice actors are viewable by everyone" ON public.character_voice_actors FOR SELECT USING (true);
GRANT SELECT ON public.character_voice_actors TO anon, authenticated;
GRANT ALL ON public.character_voice_actors TO service_role;

-- ============================================================
-- PART 7: CACHE TABLES (for caching API responses)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.anime_cache (
  mal_id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'jikan',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE public.anime_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anime cache is viewable by everyone" ON public.anime_cache;
CREATE POLICY "Anime cache is viewable by everyone" ON public.anime_cache FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_cache_synced ON public.anime_cache(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_anime_cache_expires ON public.anime_cache(expires_at);
GRANT SELECT, INSERT, UPDATE ON public.anime_cache TO anon, authenticated;
GRANT ALL ON public.anime_cache TO service_role;

CREATE TABLE IF NOT EXISTS public.anime_episodes_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL,
  page INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  UNIQUE (anime_id, page)
);

ALTER TABLE public.anime_episodes_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Episode cache is viewable by everyone" ON public.anime_episodes_cache;
CREATE POLICY "Episode cache is viewable by everyone" ON public.anime_episodes_cache FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_anime_episodes_cache_anime ON public.anime_episodes_cache(anime_id);
GRANT SELECT, INSERT, UPDATE ON public.anime_episodes_cache TO anon, authenticated;
GRANT ALL ON public.anime_episodes_cache TO service_role;

CREATE TABLE IF NOT EXISTS public.anime_lists_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '6 hours')
);

ALTER TABLE public.anime_lists_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "List cache is viewable by everyone" ON public.anime_lists_cache;
CREATE POLICY "List cache is viewable by everyone" ON public.anime_lists_cache FOR SELECT USING (true);
GRANT SELECT, INSERT, UPDATE ON public.anime_lists_cache TO anon, authenticated;
GRANT ALL ON public.anime_lists_cache TO service_role;

-- ============================================================
-- PART 8: AVATARS STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- PART 9: HELPER FUNCTIONS
-- ============================================================

-- Increment comment likes/dislikes atomically
CREATE OR REPLACE FUNCTION public.increment_comment_reaction(comment_uuid UUID, reaction_type TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF reaction_type = 'like' THEN
    UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = comment_uuid;
  ELSIF reaction_type = 'dislike' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = comment_uuid;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_comment_reaction(comment_uuid UUID, reaction_type TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF reaction_type = 'like' THEN
    UPDATE public.comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = comment_uuid;
  ELSIF reaction_type = 'dislike' THEN
    UPDATE public.comments SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = comment_uuid;
  END IF;
END;
$$;

-- Auto-increment reply count when a reply is posted
CREATE OR REPLACE FUNCTION public.increment_reply_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    UPDATE public.comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS increment_reply_count_trigger ON public.comments;
CREATE TRIGGER increment_reply_count_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.increment_reply_count();

-- Full anime search function
CREATE OR REPLACE FUNCTION public.search_anime(search_query TEXT, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE(
  id INTEGER,
  anilist_id INTEGER,
  mal_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_native TEXT,
  cover_image TEXT,
  cover_image_extra_large TEXT,
  cover_image_large TEXT,
  format TEXT,
  status TEXT,
  episodes INTEGER,
  average_score NUMERIC,
  popularity INTEGER,
  season TEXT,
  season_year INTEGER,
  rank REAL
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.mal_id, a.anilist_id, a.mal_id,
    a.title, a.title_english, a.title_native,
    a.cover_image, a.cover_image_extra_large, a.cover_image_large,
    a.format, a.status, a.episodes,
    a.average_score, a.popularity,
    a.season, a.season_year,
    ts_rank(a.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM public.anime a
  WHERE a.search_vector @@ plainto_tsquery('english', search_query)
     OR a.title ILIKE '%' || search_query || '%'
     OR a.title_english ILIKE '%' || search_query || '%'
     OR a.title_japanese ILIKE '%' || search_query || '%'
     OR a.title_native ILIKE '%' || search_query || '%'
  ORDER BY rank DESC, a.popularity DESC NULLS LAST
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- ============================================================
-- PART 10: FINAL GRANTS
-- ============================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- DONE! Run this entire file in Supabase SQL Editor.
-- Then run sync-anime.ts to populate anime data from Jikan+AniList.
-- ============================================================
