import type { SupabaseClient } from '@supabase/supabase-js';

export type WebsiteRole = 'owner' | 'editor' | 'viewer' | null;

/**
 * Checks the user's role for a specific website.
 * Returns 'owner' if they own it, 'editor'/'viewer' if they are a collaborator, or null.
 */
export async function getWebsiteRole(
  supabase: SupabaseClient,
  websiteId: string,
  userUid: string
): Promise<WebsiteRole> {
  // 1. Check if they are the owner
  const { data: website } = await supabase
    .from('websites')
    .select('user_uid')
    .eq('id', websiteId)
    .single();

  if (website && website.user_uid === userUid) {
    return 'owner';
  }

  // 2. Check if they are a collaborator
  const { data: collaborator } = await supabase
    .from('website_collaborators')
    .select('role')
    .eq('website_id', websiteId)
    .eq('user_uid', userUid)
    .single();

  if (collaborator) {
    return collaborator.role as WebsiteRole;
  }

  return null;
}

/**
 * Use this in your API routes or Server Actions to block unauthorized execution
 * (Double protection alongside RLS)
 */
export async function requireWebsiteRole(
  supabase: SupabaseClient,
  websiteId: string,
  userUid: string,
  requiredRole: 'owner' | 'editor'
) {
  const role = await getWebsiteRole(supabase, websiteId, userUid);

  if (!role) throw new Error('Unauthorized');
  if (requiredRole === 'owner' && role !== 'owner') throw new Error('Forbidden: Owner access required');
  if (requiredRole === 'editor' && role === 'viewer') throw new Error('Forbidden: Editor access required');

  return role;
}