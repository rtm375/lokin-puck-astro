import { QueryClient } from "@tanstack/react-query";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 min — show cached, refetch in background
      gcTime: 10 * 60 * 1000,   // 10 min — garbage collect unused cache
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Cross-tab sync — all open tabs share query cache via BroadcastChannel API
if (typeof window !== "undefined") {
  broadcastQueryClient({ queryClient, broadcastChannel: "lokin-sync" });
}
