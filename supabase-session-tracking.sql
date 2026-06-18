-- Run this in Supabase SQL Editor
-- Table to track known devices per user for new-login notifications

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_login TIMESTAMPTZ DEFAULT now(),
  first_seen TIMESTAMPTZ DEFAULT now(),
  is_new BOOLEAN DEFAULT true,
  UNIQUE(user_id, device_id)
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service_role to insert/update/delete
CREATE POLICY "Service role can manage all sessions"
  ON public.user_sessions
  TO service_role
  USING (true)
  WITH CHECK (true);
