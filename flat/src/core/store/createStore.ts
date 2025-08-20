import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CreateStoreOptions {
  name: string;
  persist?: boolean;
  devtools?: boolean;
}

export function createStore<T extends object>(
  initialState: T,
  options: CreateStoreOptions
) {
  const { name, persist: enablePersist = false, devtools: enableDevtools = true } = options;

  let store = create<T>();

  if (enableDevtools) {
    store = devtools(store, { name });
  }

  if (enablePersist) {
    store = persist(store, { name });
  }

  // Always use immer for immutable updates
  return create(immer(() => initialState));
}