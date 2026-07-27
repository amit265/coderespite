import MobileAds from "react-native-google-mobile-ads";

export const initializeMobileAds = async () => {
  console.log("[adInit] Initializing native Mobile Ads");
  return await MobileAds().initialize();
};
