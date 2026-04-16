-- Migration: Add custom_states to classes
ALTER TABLE public.classes ADD COLUMN custom_states JSONB DEFAULT '[]'::jsonb;