import { LRUCache } from "./cache";

// Global cache for page data
// Max 1000 pages, TTL 60 seconds
export const pageCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1 * 1000,
});
