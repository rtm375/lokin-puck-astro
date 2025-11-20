/// <reference types="astro/client" />

import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      session: Session | null;
      user: User | null;
      profile: {
        id: string;
        tier: 'free' | 'pro';
        full_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        preferences: any;
        storage_used: number;
      } | null;

      t: (key: string, options?: any) => string;
      preferences: { theme?: string; language?: string } | null;
    }
  }
}