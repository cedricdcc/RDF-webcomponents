/**
 * @fileoverview Caching layer for RDF data and shapes
 * @module rdf-webcomponents/core/cache
 * 
 * This module provides multiple caching strategies for RDF data:
 * - In-memory LRU cache
 * - localStorage cache (with size limits)
 * - IndexedDB cache (for large datasets)
 * - Shared cache across components
 */

import type { SerializedQuad } from '../../types';
import { DEFAULT_CACHE_TTL, MAX_CACHE_SIZE } from '../../types';

// ============================================================================
// Cache Entry Types
// ============================================================================

/**
 * A cached item with metadata
 */
interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** When the item was cached */
  timestamp: number;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Size estimate in bytes */
  size: number;
  /** Cache key */
  key: string;
}

/**
 * Cache statistics
 */
interface CacheStats {
  /** Total number of entries */
  entries: number;
  /** Total estimated size in bytes */
  totalSize: number;
  /** Number of hits */
  hits: number;
  /** Number of misses */
  misses: number;
  /** Hit rate */
  hitRate: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
  /** Maximum number of entries */
  maxSize?: number;
  /** Default TTL in seconds */
  defaultTtl?: number;
  /** Namespace for cache keys */
  namespace?: string;
}

// ============================================================================
// LRU Memory Cache
// ============================================================================

/**
 * LRU (Least Recently Used) memory cache implementation
 */
export class LRUCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTtl: number;
  private namespace: string;
  private stats = { hits: 0, misses: 0 };

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? MAX_CACHE_SIZE;
    this.defaultTtl = (options.defaultTtl ?? DEFAULT_CACHE_TTL) * 1000;
    this.namespace = options.namespace ?? 'default';
  }

  /**
   * Gets a cache key with namespace
   */
  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /**
   * Estimates the size of a value in bytes
   */
  private estimateSize(value: T): number {
    // Rough estimation based on JSON serialization
    try {
      return JSON.stringify(value).length * 2; // UTF-16 characters
    } catch {
      return 1000; // Default estimate for non-serializable
    }
  }

  /**
   * Checks if an entry has expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evicts expired entries and enforces size limit
   */
  private evict(): void {
    // Remove expired entries first
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If still over limit, remove least recently used
    while (this.cache.size > this.maxSize) {
      // Map maintains insertion order, so first entry is LRU
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      } else {
        break;
      }
    }
  }

  /**
   * Gets a value from the cache
   */
  get(key: string): T | undefined {
    const namespacedKey = this.getNamespacedKey(key);
    const entry = this.cache.get(namespacedKey);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(namespacedKey);
      this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(namespacedKey);
    entry.timestamp = Date.now();
    this.cache.set(namespacedKey, entry);
    
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Sets a value in the cache
   */
  set(key: string, value: T, ttl?: number): void {
    const namespacedKey = this.getNamespacedKey(key);
    
    // Remove if exists (to update position)
    if (this.cache.has(namespacedKey)) {
      this.cache.delete(namespacedKey);
    }

    // Evict if necessary
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: (ttl ?? this.defaultTtl) * 1000,
      size: this.estimateSize(value),
      key: namespacedKey,
    };

    this.cache.set(namespacedKey, entry);
  }

  /**
   * Checks if a key exists in the cache
   */
  has(key: string): boolean {
    const namespacedKey = this.getNamespacedKey(key);
    const entry = this.cache.get(namespacedKey);
    
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(namespacedKey);
      return false;
    }
    
    return true;
  }

  /**
   * Deletes a key from the cache
   */
  delete(key: string): boolean {
    const namespacedKey = this.getNamespacedKey(key);
    return this.cache.delete(namespacedKey);
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Gets cache statistics
   */
  getStats(): CacheStats {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      entries: this.cache.size,
      totalSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
    };
  }

  /**
   * Gets all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => 
      key.startsWith(`${this.namespace}:`) ? key.slice(this.namespace.length + 1) : key
    );
  }
}

// ============================================================================
// LocalStorage Cache
// ============================================================================

/**
 * LocalStorage-based cache with size limits
 */
export class LocalStorageCache<T = unknown> {
  private namespace: string;
  private maxSize: number; // Max size in bytes
  private defaultTtl: number;

  constructor(options: CacheOptions = {}) {
    this.namespace = options.namespace ?? 'rdf-cache';
    this.maxSize = 5 * 1024 * 1024; // 5MB default
    this.defaultTtl = (options.defaultTtl ?? DEFAULT_CACHE_TTL) * 1000;
    
    // Clean up expired entries on initialization
    this.cleanup();
  }

  /**
   * Gets the full key with namespace
   */
  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /**
   * Estimates current storage size
   */
  private getCurrentSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.namespace)) {
        const value = localStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
    return size * 2; // UTF-16
  }

  /**
   * Cleans up expired entries
   */
  private cleanup(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.namespace)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const entry = JSON.parse(raw) as CacheEntry<T>;
            if (Date.now() - entry.timestamp > entry.ttl) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Gets a value from localStorage
   */
  get(key: string): T | undefined {
    const namespacedKey = this.getNamespacedKey(key);
    const raw = localStorage.getItem(namespacedKey);
    
    if (!raw) return undefined;
    
    try {
      const entry = JSON.parse(raw) as CacheEntry<T>;
      
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(namespacedKey);
        return undefined;
      }
      
      return entry.value;
    } catch {
      localStorage.removeItem(namespacedKey);
      return undefined;
    }
  }

  /**
   * Sets a value in localStorage
   */
  set(key: string, value: T, ttl?: number): boolean {
    const namespacedKey = this.getNamespacedKey(key);
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: (ttl ?? this.defaultTtl) * 1000,
      size: 0,
      key: namespacedKey,
    };
    
    try {
      const serialized = JSON.stringify(entry);
      
      // Check if we have space
      const currentSize = this.getCurrentSize();
      const newSize = (namespacedKey.length + serialized.length) * 2;
      
      if (currentSize + newSize > this.maxSize) {
        // Clean up old entries to make space
        this.cleanup();
        
        if (this.getCurrentSize() + newSize > this.maxSize) {
          console.warn('LocalStorage cache full, item not cached');
          return false;
        }
      }
      
      localStorage.setItem(namespacedKey, serialized);
      return true;
    } catch (error) {
      console.warn('Failed to cache in localStorage:', error);
      return false;
    }
  }

  /**
   * Checks if a key exists
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Deletes a key
   */
  delete(key: string): void {
    localStorage.removeItem(this.getNamespacedKey(key));
  }

  /**
   * Clears all cache entries for this namespace
   */
  clear(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.namespace)) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}

// ============================================================================
// IndexedDB Cache
// ============================================================================

/**
 * IndexedDB-based cache for large datasets
 */
export class IndexedDBCache<T = unknown> {
  private dbName: string;
  private storeName: string;
  private defaultTtl: number;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(options: CacheOptions = {}) {
    this.dbName = 'rdf-webcomponents-cache';
    this.storeName = options.namespace ?? 'default';
    this.defaultTtl = (options.defaultTtl ?? DEFAULT_CACHE_TTL) * 1000;
  }

  /**
   * Initializes the database
   */
  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Gets a value from IndexedDB
   */
  async get(key: string): Promise<T | undefined> {
    await this.init();
    if (!this.db) return undefined;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        
        if (!entry) {
          resolve(undefined);
          return;
        }
        
        if (Date.now() - entry.timestamp > entry.ttl) {
          // Delete expired entry
          this.delete(key);
          resolve(undefined);
          return;
        }
        
        resolve(entry.value);
      };
    });
  }

  /**
   * Sets a value in IndexedDB
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: (ttl ?? this.defaultTtl) * 1000,
        size: 0,
        key,
      };
      
      const request = store.put(entry);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Checks if a key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Deletes a key
   */
  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clears all entries in the store
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// ============================================================================
// Unified Cache Manager
// ============================================================================

export type CacheType = 'memory' | 'localStorage' | 'indexedDB';

/**
 * Unified cache manager that supports multiple backends
 */
export class CacheManager {
  private memoryCache: LRUCache<SerializedQuad[] | unknown>;
  private localStorageCache: LocalStorageCache<SerializedQuad[] | unknown>;
  private indexedDBCache: IndexedDBCache<SerializedQuad[] | unknown>;
  private sharedCache: LRUCache<SerializedQuad[] | unknown>;
  
  private static instance: CacheManager;

  constructor() {
    this.memoryCache = new LRUCache({ namespace: 'rdf-memory' });
    this.localStorageCache = new LocalStorageCache({ namespace: 'rdf-ls' });
    this.indexedDBCache = new IndexedDBCache({ namespace: 'rdf-idb' });
    this.sharedCache = new LRUCache({ namespace: 'rdf-shared', maxSize: MAX_CACHE_SIZE * 2 });
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Gets a value from the specified cache
   */
  async get(
    key: string,
    type: CacheType = 'memory',
    shared = false
  ): Promise<SerializedQuad[] | unknown | undefined> {
    // Check shared cache first if requested
    if (shared) {
      const sharedValue = this.sharedCache.get(key);
      if (sharedValue !== undefined) {
        return sharedValue;
      }
    }

    switch (type) {
      case 'memory':
        return this.memoryCache.get(key);
      case 'localStorage':
        return this.localStorageCache.get(key);
      case 'indexedDB':
        return this.indexedDBCache.get(key);
      default:
        return this.memoryCache.get(key);
    }
  }

  /**
   * Sets a value in the specified cache
   */
  async set(
    key: string,
    value: SerializedQuad[] | unknown,
    ttl?: number,
    type: CacheType = 'memory',
    shared = false
  ): Promise<void> {
    // Set in shared cache if requested
    if (shared) {
      this.sharedCache.set(key, value, ttl);
    }

    switch (type) {
      case 'memory':
        this.memoryCache.set(key, value, ttl);
        break;
      case 'localStorage':
        this.localStorageCache.set(key, value, ttl);
        break;
      case 'indexedDB':
        await this.indexedDBCache.set(key, value, ttl);
        break;
    }
  }

  /**
   * Checks if a key exists in the specified cache
   */
  async has(key: string, type: CacheType = 'memory', shared = false): Promise<boolean> {
    if (shared && this.sharedCache.has(key)) {
      return true;
    }

    switch (type) {
      case 'memory':
        return this.memoryCache.has(key);
      case 'localStorage':
        return this.localStorageCache.has(key);
      case 'indexedDB':
        return this.indexedDBCache.has(key);
      default:
        return this.memoryCache.has(key);
    }
  }

  /**
   * Deletes a key from all caches
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.localStorageCache.delete(key);
    await this.indexedDBCache.delete(key);
    this.sharedCache.delete(key);
  }

  /**
   * Clears all caches
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    this.localStorageCache.clear();
    await this.indexedDBCache.clear();
    this.sharedCache.clear();
  }

  /**
   * Gets memory cache statistics
   */
  getStats(): CacheStats {
    return this.memoryCache.getStats();
  }

  /**
   * Gets the shared cache
   */
  getSharedCache(): LRUCache<SerializedQuad[] | unknown> {
    return this.sharedCache;
  }
}

// ============================================================================
// Cache Key Generators
// ============================================================================

/**
 * Generates a cache key for RDF data
 */
export function generateRdfCacheKey(url: string, options?: {
  strategy?: string;
  subject?: string;
  query?: string;
}): string {
  const parts = [url];
  
  if (options?.strategy) parts.push(`strategy:${options.strategy}`);
  if (options?.subject) parts.push(`subject:${options.subject}`);
  if (options?.query) {
    // Hash the query for shorter keys
    const queryHash = hashString(options.query);
    parts.push(`query:${queryHash}`);
  }
  
  return parts.join('|');
}

/**
 * Generates a cache key for SHACL shapes
 */
export function generateShapeCacheKey(url: string): string {
  return `shapes:${url}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
