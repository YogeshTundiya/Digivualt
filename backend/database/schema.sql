-- ============================================
-- Digital Legacy Vault - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.vault_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dead Man's Switch configuration table
CREATE TABLE IF NOT EXISTS public.dead_mans_switch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.vault_users(id) ON DELETE CASCADE,
    
    -- Check-in tracking
    last_check_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    inactivity_period_days INTEGER DEFAULT 180,
    
    -- Nominee information
    nominee_email TEXT NOT NULL,
    nominee_name TEXT,
    nominee_relation TEXT,
    personal_message TEXT,
    
    -- Switch state
    is_active BOOLEAN DEFAULT FALSE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    
    -- Access token for nominee
    access_token UUID DEFAULT uuid_generate_v4(),
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encrypted vault data table
CREATE TABLE IF NOT EXISTS public.encrypted_vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.vault_users(id) ON DELETE CASCADE,
    
    -- Encrypted blob (contains salt, iv, ciphertext)
    encrypted_data JSONB NOT NULL,
    
    -- Metadata (not encrypted)
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-in history for audit trail
CREATE TABLE IF NOT EXISTS public.check_in_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    switch_id UUID REFERENCES public.dead_mans_switch(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Email notification log
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    switch_id UUID REFERENCES public.dead_mans_switch(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL, -- 'warning', 'final_warning', 'triggered', 'test'
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_switch_user_id ON public.dead_mans_switch(user_id);
CREATE INDEX IF NOT EXISTS idx_switch_last_check_in ON public.dead_mans_switch(last_check_in);
CREATE INDEX IF NOT EXISTS idx_switch_is_active ON public.dead_mans_switch(is_active);
CREATE INDEX IF NOT EXISTS idx_switch_access_token ON public.dead_mans_switch(access_token);
CREATE INDEX IF NOT EXISTS idx_vault_user_id ON public.encrypted_vaults(user_id);

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update 'updated_at'
DROP TRIGGER IF EXISTS update_vault_users_updated_at ON public.vault_users;
CREATE TRIGGER update_vault_users_updated_at
    BEFORE UPDATE ON public.vault_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dead_mans_switch_updated_at ON public.dead_mans_switch;
CREATE TRIGGER update_dead_mans_switch_updated_at
    BEFORE UPDATE ON public.dead_mans_switch
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_encrypted_vaults_updated_at ON public.encrypted_vaults;
CREATE TRIGGER update_encrypted_vaults_updated_at
    BEFORE UPDATE ON public.encrypted_vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.vault_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dead_mans_switch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.vault_users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON public.vault_users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can view own switch" ON public.dead_mans_switch
    FOR SELECT USING (user_id IN (SELECT id FROM public.vault_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own switch" ON public.dead_mans_switch
    FOR ALL USING (user_id IN (SELECT id FROM public.vault_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view own vault" ON public.encrypted_vaults
    FOR SELECT USING (user_id IN (SELECT id FROM public.vault_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own vault" ON public.encrypted_vaults
    FOR ALL USING (user_id IN (SELECT id FROM public.vault_users WHERE auth_user_id = auth.uid()));

-- Service role can access everything (for cron job)
-- Note: Service role bypasses RLS by default

COMMENT ON TABLE public.dead_mans_switch IS 'Dead Man''s Switch configuration for automatic vault sharing';
COMMENT ON COLUMN public.dead_mans_switch.last_check_in IS 'Last time the user confirmed they are still alive';
COMMENT ON COLUMN public.dead_mans_switch.inactivity_period_days IS 'Days of inactivity before triggering the switch';
COMMENT ON COLUMN public.dead_mans_switch.access_token IS 'Secure token sent to nominee for vault access';
