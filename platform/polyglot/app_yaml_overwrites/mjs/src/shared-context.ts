/**
 * SharedContext Module for app-yaml-overwrites package.
 *
 * Provides a mutable state container for computed functions to share data
 * during a single resolution pass (either STARTUP or REQUEST scope).
 *
 * Enhanced Features:
 * - Unified .get(key, default) - handles values, functions, objects
 * - Async support via .getAsync() for async factories
 * - Parent context support - REQUEST can access STARTUP-registered values
 * - .register() for explicit utility registration at STARTUP
 *
 * Usage:
 *     // Simple get with callable default (auto-caches result)
 *     const timestamp = ctx.shared.get('timestamp', () => Date.now());
 *
 *     // Register utilities at STARTUP
 *     ctx.shared.register('tokenGenerator', new TokenGenerator());
 *
 *     // Access at REQUEST time (if parent context set)
 *     const generator = ctx.shared.get('tokenGenerator');
 */

type Factory<T> = () => T;
type AsyncFactory<T> = () => Promise<T>;
type DefaultValue<T> = T | Factory<T>;

/**
 * Shared state container for resolution lifecycle.
 *
 * Features:
 * - Unified get(key, default) - callable defaults are invoked and cached
 * - Async support via getAsync() for async factories
 * - Parent context - REQUEST context can inherit from STARTUP context
 * - register() for explicit utility/value registration
 * - getOrSet() maintained for backwards compatibility
 *
 * @example
 * // Simplified API - callable default is invoked and cached
 * const timestamp = ctx.shared.get('ts', () => Math.floor(Date.now() / 1000));
 *
 * // Same result on subsequent calls (cached)
 * const timestamp = ctx.shared.get('ts', () => Math.floor(Date.now() / 1000));
 *
 * // Register utilities at STARTUP
 * ctx.shared.register('utils', new MyUtilityClass());
 *
 * // Access registered utilities
 * const utils = ctx.shared.get('utils');
 */
export class SharedContext {
    private _data: Map<string, any>;
    private _utils: Map<string, any>;
    private _parent: SharedContext | null;

    /**
     * Initialize shared context.
     *
     * @param parent - Optional parent context (e.g., STARTUP context for REQUEST)
     *                 Allows REQUEST scope to access STARTUP-registered values.
     */
    constructor(parent: SharedContext | null = null) {
        this._data = new Map();
        this._utils = new Map();
        this._parent = parent;
    }

    /**
     * Get a value from shared context with smart default handling.
     *
     * If default is callable (function), it will be invoked and the result cached.
     * This provides a unified API for all use cases:
     * - .get('key') - returns value or undefined
     * - .get('key', 'default') - returns value or 'default'
     * - .get('key', () => Date.now()) - returns value or calls factory
     * - .get('key', new MyClass()) - returns value or the object instance
     *
     * @param key - The key to retrieve
     * @param defaultValue - Default value, factory function, or object
     * @returns The stored value, computed value, or default
     */
    get<T = any>(key: string, defaultValue?: DefaultValue<T>): T | undefined {
        // Check local data first
        if (this._data.has(key)) {
            return this._data.get(key) as T;
        }

        // Check utilities
        if (this._utils.has(key)) {
            return this._utils.get(key) as T;
        }

        // Check parent context if available
        if (this._parent !== null) {
            const parentValue = this._parent._getFromParent(key);
            if (parentValue !== undefined) {
                return parentValue as T;
            }
        }

        // Handle default
        if (defaultValue === undefined) {
            return undefined;
        }

        // If callable (function), invoke and cache
        if (typeof defaultValue === 'function') {
            try {
                const value = (defaultValue as Factory<T>)();
                this._data.set(key, value); // Cache the result
                return value;
            } catch {
                // If calling fails, return as-is
                return defaultValue as unknown as T;
            }
        }

        return defaultValue as T;
    }

    /**
     * Async version of get() for async factories.
     *
     * Handles both sync and async callables as defaults.
     *
     * @param key - The key to retrieve
     * @param defaultValue - Default value, factory function (sync or async), or object
     * @returns The stored value, computed value, or default
     */
    async getAsync<T = any>(key: string, defaultValue?: DefaultValue<T> | AsyncFactory<T>): Promise<T | undefined> {
        // Check local data first
        if (this._data.has(key)) {
            return this._data.get(key) as T;
        }

        // Check utilities
        if (this._utils.has(key)) {
            return this._utils.get(key) as T;
        }

        // Check parent context if available
        if (this._parent !== null) {
            const parentValue = this._parent._getFromParent(key);
            if (parentValue !== undefined) {
                return parentValue as T;
            }
        }

        // Handle default
        if (defaultValue === undefined) {
            return undefined;
        }

        // If callable (function), invoke and cache
        if (typeof defaultValue === 'function') {
            try {
                const result = (defaultValue as Function)();
                // Check if it's a promise
                const value = result instanceof Promise ? await result : result;
                this._data.set(key, value); // Cache the result
                return value;
            } catch {
                return defaultValue as unknown as T;
            }
        }

        return defaultValue as T;
    }

    /**
     * Get value from this context (used by child contexts).
     */
    private _getFromParent(key: string): any {
        if (this._data.has(key)) {
            return this._data.get(key);
        }
        if (this._utils.has(key)) {
            return this._utils.get(key);
        }
        if (this._parent !== null) {
            return this._parent._getFromParent(key);
        }
        return undefined;
    }

    /**
     * Set a value in shared context.
     *
     * @param key - The key to set
     * @param value - The value to store
     * @returns The stored value (for chaining)
     */
    set<T>(key: string, value: T): T {
        this._data.set(key, value);
        return value;
    }

    /**
     * Register a utility, class instance, or computed value.
     *
     * Use this at STARTUP to register utilities that will be
     * accessible at REQUEST time via child contexts.
     *
     * @param key - The key to register under
     * @param value - The value, class instance, or factory function
     * @param lazy - If true and value is callable, defer execution until first access
     * @returns Self for chaining
     *
     * @example
     * // Register at STARTUP
     * ctx.shared.register('tokenGen', new TokenGenerator());
     * ctx.shared.register('timestamp', () => Date.now(), true);
     *
     * // Access at REQUEST
     * const gen = ctx.shared.get('tokenGen');
     */
    register<T>(key: string, value: T | Factory<T>, lazy: boolean = false): SharedContext {
        if (lazy && typeof value === 'function') {
            // Store as lazy factory - will be called on first access
            this._data.set(key, new LazyValue(value as Factory<T>));
        } else {
            this._utils.set(key, value);
        }
        return this;
    }

    /**
     * Register a utility class or object.
     *
     * Alias for register() for semantic clarity.
     *
     * @param key - The key to register under
     * @param util - The utility class instance or object
     * @returns Self for chaining
     */
    registerUtil(key: string, util: any): SharedContext {
        return this.register(key, util);
    }

    /**
     * Get a registered utility.
     *
     * @param key - The utility key
     * @param defaultValue - Default if not found
     * @returns The registered utility or default
     */
    getUtil<T = any>(key: string, defaultValue?: T): T | undefined {
        if (this._utils.has(key)) {
            return this._utils.get(key) as T;
        }
        if (this._parent !== null) {
            return this._parent.getUtil(key, defaultValue);
        }
        return defaultValue;
    }

    /**
     * Get all registered utilities.
     *
     * @returns Record of all registered utilities (including parent's)
     */
    getUtils(): Record<string, any> {
        const utils: Record<string, any> = {};
        if (this._parent !== null) {
            Object.assign(utils, this._parent.getUtils());
        }
        for (const [key, value] of this._utils) {
            utils[key] = value;
        }
        return utils;
    }

    /**
     * Get existing value or set from factory if not present.
     *
     * @deprecated Use .get(key, factory) instead.
     *
     * Maintained for backwards compatibility.
     *
     * @param key - The key to get or set
     * @param factory - Function that returns the value to set
     * @returns The existing or newly created value
     */
    getOrSet<T>(key: string, factory: () => T): T {
        if (!this._data.has(key)) {
            this._data.set(key, factory());
        }
        return this._data.get(key) as T;
    }

    /**
     * Check if a key exists in shared context (including parent).
     */
    has(key: string): boolean {
        if (this._data.has(key) || this._utils.has(key)) {
            return true;
        }
        if (this._parent !== null) {
            return this._parent.has(key);
        }
        return false;
    }

    /**
     * Delete a key from shared context.
     *
     * @returns True if key existed and was deleted
     */
    delete(key: string): boolean {
        const deletedData = this._data.delete(key);
        const deletedUtils = this._utils.delete(key);
        return deletedData || deletedUtils;
    }

    /**
     * Get all keys in shared context (including parent).
     */
    keys(): string[] {
        const allKeys = new Set([
            ...this._data.keys(),
            ...this._utils.keys()
        ]);
        if (this._parent !== null) {
            for (const key of this._parent.keys()) {
                allKeys.add(key);
            }
        }
        return Array.from(allKeys);
    }

    /**
     * Get all values in shared context.
     */
    values(): any[] {
        return [
            ...this._data.values(),
            ...this._utils.values()
        ];
    }

    /**
     * Get all key-value pairs in shared context.
     */
    entries(): [string, any][] {
        return [
            ...this._data.entries(),
            ...this._utils.entries()
        ];
    }

    /**
     * Clear all shared context data (does not affect parent).
     */
    clear(): void {
        this._data.clear();
        this._utils.clear();
    }

    /**
     * Update shared context with multiple key-value pairs.
     */
    update(data: Record<string, any>): void {
        for (const [key, value] of Object.entries(data)) {
            this._data.set(key, value);
        }
    }

    /**
     * Set parent context and return self for chaining.
     *
     * @param parent - Parent context to inherit from
     * @returns Self for chaining
     */
    withParent(parent: SharedContext): SharedContext {
        this._parent = parent;
        return this;
    }

    /**
     * Create a child context that inherits from this one.
     *
     * Useful for creating REQUEST context from STARTUP context.
     *
     * @returns New SharedContext with this as parent
     */
    createChild(): SharedContext {
        return new SharedContext(this);
    }

    /**
     * Return number of items in shared context.
     */
    get size(): number {
        return this._data.size + this._utils.size;
    }

    /**
     * String representation for debugging.
     */
    toString(): string {
        const parentInfo = this._parent ? ', parent=true' : '';
        return `SharedContext(data=${JSON.stringify(Array.from(this._data.keys()))}, utils=${JSON.stringify(Array.from(this._utils.keys()))}${parentInfo})`;
    }
}

/**
 * Wrapper for lazy-evaluated values.
 */
class LazyValue<T> {
    private _factory: Factory<T>;
    private _value: T | undefined;
    private _evaluated: boolean = false;

    constructor(factory: Factory<T>) {
        this._factory = factory;
    }

    get(): T {
        if (!this._evaluated) {
            this._value = this._factory();
            this._evaluated = true;
        }
        return this._value as T;
    }
}

/**
 * Factory function to create a new SharedContext.
 *
 * @param parent - Optional parent context for inheritance
 * @returns New SharedContext instance
 */
export function createSharedContext(parent: SharedContext | null = null): SharedContext {
    return new SharedContext(parent);
}
