/**
 * Reusable fetch utilities for Zustand stores
 * Implements smart caching to prevent duplicate API calls
 */

/**
 * Check if a fetch should proceed based on current state
 * @param currentId - The ID being fetched (null if inflight fetch exists)
 * @param targetId - The ID we want to fetch
 * @param hasData - Whether we already have data cached
 * @param force - Force fetch even if cache exists
 * @returns true if fetch should proceed
 */
export function shouldFetch(
  currentId: string | null,
  targetId: string,
  hasData: boolean,
  force: boolean = false,
): boolean {
  // Don't fetch if already fetching this ID
  if (currentId === targetId) {
    return false;
  }

  // Always fetch if forced
  if (force) {
    return true;
  }

  // Fetch if no cached data
  return !hasData;
}

/**
 * Generic fetch handler with error handling
 * @param url - API endpoint to fetch
 * @param onSuccess - Callback when fetch succeeds
 * @param onError - Optional error handler
 */
import { api } from "@/lib/client";

export async function fetchData<T>(
  url: string,
  onSuccess: (data: T) => void,
  onError?: (error: Error) => void,
): Promise<void> {
  try {
    const data = await api.get<T>(url);
    onSuccess(data);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (onError) {
      onError(error);
    } else {
      console.error("Fetch failed:", error);
    }
  }
}
