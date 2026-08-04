import AsyncStorageModule from '@react-native-async-storage/async-storage';

// Async Wrapper that perfectly mimics our old implementation
export const AsyncStorage = {
  getItem: async (key) => {
    return await AsyncStorageModule.getItem(key);
  },
  setItem: async (key, value) => {
    await AsyncStorageModule.setItem(key, value);
  },
  removeItem: async (key) => {
    await AsyncStorageModule.removeItem(key);
  },
  clear: async () => {
    await AsyncStorageModule.clear();
  },
  getAllKeys: async () => {
    return await AsyncStorageModule.getAllKeys();
  },
  multiGet: async (keys) => {
    return await AsyncStorageModule.multiGet(keys);
  },
};

export default AsyncStorage;
