import { MMKV } from "react-native-mmkv";

// Centralized MMKV instance
export const storage = new MMKV();

// Async Wrapper to act as a drop-in replacement for AsyncStorage
export const AsyncStorage = {
  getItem: async (key) => {
    const value = storage.getString(key);
    return value !== undefined ? value : null;
  },
  setItem: async (key, value) => {
    storage.set(key, value);
  },
  removeItem: async (key) => {
    storage.delete(key);
  },
  clear: async () => {
    storage.clearAll();
  },
  getAllKeys: async () => {
    return storage.getAllKeys();
  },
};

export default AsyncStorage;
