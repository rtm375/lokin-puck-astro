import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { shouldFetch, fetchData } from "@/utils/fetchHelpers";
import type { Profile } from "@/types";

interface UserState {
  profile: Profile | null;
  isLoading: boolean;
  fetchingProfile: boolean; // Track if fetch is in progress
  error: string | null;
  fetchProfile: (force?: boolean) => Promise<void>;
  setProfile: (profile: Profile) => void;
  reset: () => void;
}

export const useProfileStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      fetchingProfile: false,
      error: null,

      setProfile: (profile) => set({ profile }),

      fetchProfile: async (force: boolean = false) => {
        const { profile, fetchingProfile } = get();

        // Prevent duplicate requests
        if (fetchingProfile) {
          return;
        }

        // Smart caching: skip if already have profile data
        if (!force && profile) {
          return;
        }

        set({ isLoading: true, fetchingProfile: true });
        await fetchData<any>(
          "/api/profile/get",
          (data) => set({ profile: data }),
          (err) => console.error("Failed to load profile", err),
        );
        set({ isLoading: false, fetchingProfile: false });
      },
      reset: () => {
        set({
          profile: null,
          isLoading: false,
          fetchingProfile: false,
          error: null,
        });
      },
    }),
    {
      name: "profile",
      storage: createJSONStorage(() => {
        return localStorage;
      }),
    },
  ),
);
