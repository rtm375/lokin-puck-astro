import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Profile } from "@/types";

export const profileKeys = {
  all: ["profile"] as const,
};

export function useProfileQuery() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: () => api.get<Profile>("/api/profile/get"),
  });
}
