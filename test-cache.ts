import { LRUCache } from "./src/lib/cache";

const cache = new LRUCache<string, string>({ max: 3, ttl: 1000 });

console.log("Testing LRU Cache...");

// Test Set/Get
cache.set("a", "1");
cache.set("b", "2");
cache.set("c", "3");

if (cache.get("a") !== "1") throw new Error("Failed get 'a'");
if (cache.get("b") !== "2") throw new Error("Failed get 'b'");
if (cache.get("c") !== "3") throw new Error("Failed get 'c'");
console.log("Set/Get passed");

// Reset for Eviction Test
cache.clear();
cache.set("a", "1");
cache.set("b", "2");
cache.set("c", "3");
// Order: [a, b, c] (a is oldest)

// Access 'a' to make it fresh
cache.get("a");
// Order: [b, c, a] (b is oldest)

cache.set("d", "4"); // Should evict 'b'

if (cache.get("b") !== null)
  throw new Error("Eviction failed: 'b' should be gone");
if (cache.get("a") !== "1")
  throw new Error("Eviction failed: 'a' should exist");
if (cache.get("d") !== "4")
  throw new Error("Eviction failed: 'd' should exist");
if (cache.get("a") !== "1")
  throw new Error("Eviction failed: 'a' should exist");
if (cache.get("d") !== "4")
  throw new Error("Eviction failed: 'd' should exist");
console.log("Eviction passed");

// Test TTL
setTimeout(() => {
  if (cache.get("d") !== null)
    throw new Error("TTL failed: 'd' should be expired");
  console.log("TTL passed");
}, 1100);
