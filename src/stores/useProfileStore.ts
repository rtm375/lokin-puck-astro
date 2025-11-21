import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  profile: any | null;
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: (profile: any) => void; // <--- NEW ACTION
}

export const useUseProfileStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      
      setProfile: (profile) => set({ profile }),

      fetchProfile: async (userId: string) => {
        console.log('test');
        
        const current = get().profile;
        if (current && current.id === userId) return;

        try {
          const response = await fetch('/api/profile');
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
      name: 'profile', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);