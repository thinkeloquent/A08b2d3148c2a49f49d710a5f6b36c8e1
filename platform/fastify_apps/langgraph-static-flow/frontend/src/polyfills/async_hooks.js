/**
 * Browser polyfill for node:async_hooks — provides a minimal AsyncLocalStorage
 * shim so @langchain/langgraph can run in the browser.
 */
export class AsyncLocalStorage {
  #store = undefined;

  getStore() {
    return this.#store;
  }

  run(store, fn, ...args) {
    const prev = this.#store;
    this.#store = store;
    try {
      return fn(...args);
    } finally {
      this.#store = prev;
    }
  }

  enterWith(store) {
    this.#store = store;
  }

  disable() {
    this.#store = undefined;
  }
}

export class AsyncResource {
  constructor() {}
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.apply(thisArg, args);
  }
  emitDestroy() {}
}

export function executionAsyncId() { return 1; }
export function triggerAsyncId() { return 0; }
export function createHook() { return { enable() {}, disable() {} }; }

export default { AsyncLocalStorage, AsyncResource, executionAsyncId, triggerAsyncId, createHook };
