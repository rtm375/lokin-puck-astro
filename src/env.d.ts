/// <reference types="astro/client" />

import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      session: Session | null;
      user: User | null;
      t: (key: string, options?: any) => string;
      preferences: { theme?: string; language?: string } | null;
    }
  }
}