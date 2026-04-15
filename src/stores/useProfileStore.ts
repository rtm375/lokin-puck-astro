/**
 * @deprecated Use useProfileQuery() from @/hooks/queries/useProfileQuery instead.
 * This store is kept for backward compatibility only.
 * Profile data is now managed by TanStack Query.
 */
import { create } from "zustand";
import type { Profile } from "@/types";

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  reset: () => set({ profile: null }),
}));
