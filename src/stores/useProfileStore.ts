import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserState {
  profile: any | null;
  fetchProfile: () => Promise<void>;
  setProfile: (profile: any) => void; // <--- NEW ACTION
}

export const useProfileStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,

      setProfile: (profile) => set({ profile }),

      fetchProfile: async () => {
        if (get().profile) return;

        try {
          const response = await fetch("/api/profile/get");
          if (response.ok) {
            const data = await response.json();
            if (data) {
              set({ profile: data });
            }
          }
        } catch (err) {
          console.error("Failed to load profile", err);
        }
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
