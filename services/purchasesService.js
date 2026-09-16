import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { updateUserData } from './userStorage';

// TODO: Replace with real API keys from RevenueCat Dashboard
const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || "",
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || "",
};

export const initPurchases = async () => {
  try {
    const key = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
    
    if (!key || key.includes('XXXX')) {
      console.warn("[RevenueCat] API Key is missing or invalid. RevenueCat will not be configured.");
      return;
    }

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.google });
    }
    
    // Check if the user is already Pro on app start
    const customerInfo = await Purchases.getCustomerInfo();
    await updateProStatus(customerInfo);
    
    // Listen for customer info updates (e.g. they purchase on another device)
    Purchases.addCustomerInfoUpdateListener(async (info) => {
      await updateProStatus(info);
    });
    
    console.log("[RevenueCat] Configured successfully.");
  } catch (e) {
    console.error("[RevenueCat] Configuration Error:", e);
  }
};

const updateProStatus = async (customerInfo) => {
  const isPro = typeof customerInfo.entitlements.active["Pro"] !== "undefined";
  await updateUserData((data) => {
    data.profile.isPro = isPro;
    return data;
  });
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      return offerings.current.availablePackages;
    }
  } catch (e) {
    console.error("[RevenueCat] Get Offerings Error:", e);
  }
  return [];
};

export const purchasePackage = async (pack) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pack);
    await updateProStatus(customerInfo);
    return typeof customerInfo.entitlements.active["Pro"] !== "undefined";
  } catch (e) {
    if (!e.userCancelled) {
      console.error("[RevenueCat] Purchase Error:", e);
    }
    return false;
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    await updateProStatus(customerInfo);
    return typeof customerInfo.entitlements.active["Pro"] !== "undefined";
  } catch (e) {
    console.error("[RevenueCat] Restore Error:", e);
    return false;
  }
};
