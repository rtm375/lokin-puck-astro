export class LRUCache<K, V> {
  private max: number;
  private ttl: number;
  private cache: Map<K, { value: V; expiry: number }>;

  constructor(options: { max: number; ttl: number }) {
    this.max = options.max;
    this.ttl = options.ttl;
    this.cache = new Map();
  }

  get(key: K): V | null {
    const item = this.cache.get(key);

    // If item doesn't exist, return null
    if (!item) return null;

    // If item is expired, delete and return null
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh item (delete and re-add to make it most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: K, value: V): void {
    // If cache is full, delete the oldest item (first item in Map)
    if (this.cache.size >= this.max) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  clear(): void {
    this.cache.clear();
  }
}
