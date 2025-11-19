// src/env.d.ts

/// <reference types="astro/client" />

// Import the types
import type { SupabaseClient, Session } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      // Add your properties here
      supabase: SupabaseClient;
      session: Session | null;
      user: User | null;
    }
  }
}