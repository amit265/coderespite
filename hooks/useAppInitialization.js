import { useState, useEffect, useContext } from "react";
import AsyncStorage from "../services/storage";
import { SplashScreen, useRouter } from "expo-router";
import { adConfigContext } from "../context/context";
import { useGlobalRefresh } from "./useGlobalRefresh";

export const useAppInitialization = () => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const { refreshData, refreshing } = useGlobalRefresh();
  const adConfigValue = useContext(adConfigContext);
  const setAdConfig = adConfigValue?.setAdConfig;

  // 1. Initialization Logic
  useEffect(() => {
    let isMounted = true; 

    const initialize = async () => {
      // Local Ad Config
      if (setAdConfig) {
        setAdConfig({
          showAds: true,
          showInterstitialAds: true,
          showAppOpenAds: true,
          showNativeAds: true,
          showBannerAds: true,
          testAds: false,
          interstitialFrequency: 10,
          appOpenAdFrequency: 10
        });
      }

      try {
        // Load Global Data (Locally)
        await refreshData(false);

        // Check Navigation
        const storedUser = await AsyncStorage.getItem("@user_data");
        if (storedUser && isMounted) {
          const user = JSON.parse(storedUser);
          if (user?.profile?.firstTime === false || (user?.profile?.name && user.profile.name !== "user")) {
             setIsFirstTime(false);
             setTimeout(() => {
               if(isMounted) router.replace("(tabs)");
             }, 100);
          } else {
             setIsFirstTime(true);
          }
        }
      } catch (e) {
        console.warn("Init Error:", e);
      } finally {
        if (isMounted) {
          setIsReady(true);
          await SplashScreen.hideAsync();
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [setAdConfig]); 

  // 2. Custom Splash Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return {
    isReady,
    showCustomSplash,
    isFirstTime,
    refreshing,
    refreshData,
  };
};