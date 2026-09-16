import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform, View } from "react-native";
import {
  AdEventType,
  AppOpenAd,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { adConfigContext } from "../context/context";
import colors from "../constants/colors";

const adUnits = {
  banner: {
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_ANDROID || "ca-app-pub-7433519007687449/9531365889",
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_IOS || "ca-app-pub-7433519007687449/5570092969",
  },
  interstitial: {
    android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID || "ca-app-pub-7433519007687449/7195403622",
    ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_IOS || "ca-app-pub-7433519007687449/7733221875",
  },
  appOpen: {
    android: process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_UNIT_ID_ANDROID || "ca-app-pub-7433519007687449/6961042869",
    ios: process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_UNIT_ID_IOS || "ca-app-pub-7433519007687449/1274315229",
  },
  nativeAdvanced: {
    android: process.env.EXPO_PUBLIC_ADMOB_NATIVE_UNIT_ID_ANDROID || "ca-app-pub-7433519007687449/3505013580",
    ios: process.env.EXPO_PUBLIC_ADMOB_NATIVE_UNIT_ID_IOS || "ca-app-pub-7433519007687449/8227570532",
  },
  rewarded: {
    android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID || "ca-app-pub-3940256099942544/5224354917", // Test id
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS || "ca-app-pub-3940256099942544/1712485313", // Test id
  },
};


const getAdUnitId = (type) => {
  return Platform.select({
    ios: adUnits[type].ios,
    android: adUnits[type].android,
    default: adUnits[type].android,
  });
};

// ✅ Ad references
let interstitialAd;
let appOpenAd;

const AdManager = () => {
  const { adConfig, clickCount, adsReady } = useContext(adConfigContext);
  const interstitialJustShown = useRef(false);
  const appPauseCount = useRef(0);

  useEffect(() => {
    if (!adsReady || !adConfig?.showAds) return;

    console.log("[Ads] App state listener active", {
      appOpenAdFrequency: adConfig?.appOpenAdFrequency,
      showAppOpenAds: adConfig?.showAppOpenAds,
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log("[Ads] App state changed", nextAppState);

      if (nextAppState === "active" && !interstitialJustShown.current) {
        appPauseCount.current += 1;
        console.log("[Ads] App open trigger check", {
          appPauseCount: appPauseCount.current,
          appOpenAdFrequency: adConfig?.appOpenAdFrequency,
          showAppOpenAds: adConfig?.showAppOpenAds,
          appOpenLoaded: appOpenAd?.loaded,
        });

        if (
          appPauseCount.current % adConfig?.appOpenAdFrequency === 0 &&
          adConfig.showAppOpenAds &&
          appOpenAd?.loaded
        ) {
          console.log("[Ads] Showing app open ad");
          appOpenAd.show();
        }
      }
      interstitialJustShown.current = false;
    });

    return () => subscription.remove();
  }, [adConfig, adsReady]);

  useEffect(() => {
    if (!adsReady || !adConfig?.showAds) return;

    console.log("[Ads] Interstitial trigger check", {
      clickCount,
      interstitialFrequency: adConfig?.interstitialFrequency,
      showInterstitialAds: adConfig?.showInterstitialAds,
    });

    if (
      clickCount > 0 &&
      adConfig?.showInterstitialAds &&
      adConfig?.interstitialFrequency &&
      clickCount % adConfig?.interstitialFrequency === 0
    ) {
      showInterstitialAd(adConfig);
    }
  }, [clickCount, adConfig, adsReady]);

  const isLoadingAds = useRef(false);
  const loadAds = useCallback((config) => {
    if (isLoadingAds.current) return;

    isLoadingAds.current = true;
    setTimeout(() => {
      isLoadingAds.current = false;
    }, 5000);

    interstitialAd = InterstitialAd.createForAdRequest(
      getAdUnitId("interstitial"),
    );
    appOpenAd = AppOpenAd.createForAdRequest(
      getAdUnitId("appOpen"),
    );

    console.log("[Ads] Creating ad requests", {
      interstitialUnitId: getAdUnitId("interstitial"),
      appOpenUnitId: getAdUnitId("appOpen"),
      showAds: config?.showAds,
      showInterstitialAds: config?.showInterstitialAds,
      showAppOpenAds: config?.showAppOpenAds,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("[Ads] Interstitial loaded");
    });

    interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log("[Ads] Interstitial opened");
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("[Ads] Interstitial closed, reloading");
      interstitialJustShown.current = true;
      interstitialAd.load();
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error("[Ads] Interstitial error", error);
    });

    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("[Ads] App open ad loaded");
    });

    appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log("[Ads] App open ad opened");
    });

    interstitialAd.load();
    console.log("[Ads] Interstitial load requested");

    appOpenAd.addAdEventListener(AdEventType.CLOSED, () =>
      setTimeout(() => {
        console.log("[Ads] App open ad closed, reloading");
        appOpenAd.load();
      }, 3000),
    );

    appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error("[Ads] App open ad error", error);
    });

    appOpenAd.load();
    console.log("[Ads] App open ad load requested");
  }, [interstitialJustShown]);

  useEffect(() => {
    if (!adsReady || !adConfig?.showAds) return;

    loadAds(adConfig);
  }, [adConfig, adsReady, loadAds]);

  return null;
};

export const showInterstitialAd = (adConfig) => {
  if (interstitialAd?.loaded && adConfig.showAds && adConfig.showInterstitialAds) {
    console.log("[Ads] showInterstitialAd invoked: showing interstitial");
    interstitialAd.show();
    interstitialAd.load();
  } else {
    console.log("[Ads] showInterstitialAd invoked: interstitial not ready, loading");
    interstitialAd?.load();
  }
};

export const showRewardedAd = (onEarnedReward, onClosed) => {
  const rewarded = RewardedAd.createForAdRequest(getAdUnitId("rewarded"));

  const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewarded.show();
  });

  const unsubscribeEarned = rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    reward => {
      if (onEarnedReward) onEarnedReward(reward);
    },
  );

  const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    if (onClosed) onClosed();
    unsubscribeLoaded();
    unsubscribeEarned();
    unsubscribeClosed();
  });

  rewarded.load();
};

export const BannerAdComponent = ({ fixed = false }) => {
  if (!adConfigContext || !adConfigContext.Provider) return null;
  const { adConfig, adsReady } = useContext(adConfigContext);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  if (!adsReady || !adConfig.showAds || !adConfig.showBannerAds) return null;

  const containerStyle = [
    {
      opacity: isAdLoaded ? 1 : 0,
      height: isAdLoaded ? undefined : 0,
      backgroundColor: colors.BACKGROUND || "#fff",
      alignItems: 'center',
      justifyContent: 'center',
    },
    fixed && {
      position: 'absolute',
      bottom: insets.bottom,
      left: 0,
      right: 0,
      paddingBottom: insets.bottom > 0 ? 4 : 0,
      zIndex: 1000,
    }
  ];

  return (
    <View style={containerStyle}>
      <BannerAd
        unitId={getAdUnitId("banner")}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          console.log("[Ads] Banner ad loaded");
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => console.error("Banner Ad Error:", error)}
      />
    </View>
  );
};

export const NativeAdComponent = () => {
  if (!adConfigContext || !adConfigContext.Provider) {
    return null;
  }
  
  let contextValues;
  try {
    contextValues = useContext(adConfigContext);
    console.log("[Ads] useContext succeeded!", !!contextValues);
  } catch (e) {
    console.log("[Ads] useContext FAILED:", e.message);
    throw e;
  }
  
  const { adConfig, adsReady } = contextValues;
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (!adsReady || !adConfig?.showAds || !adConfig?.showNativeAds) return null;

  console.log("[Ads] NativeAdView type:", typeof NativeAdView);
  console.log("[Ads] Rendering NativeAdView...");
  return (
    <View style={[{
      opacity: isAdLoaded ? 1 : 0,
      height: isAdLoaded ? undefined : 0,
    }, isAdLoaded && {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      backgroundColor: "#fff",
      borderRadius: 10,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }]}>
      <BannerAd
        unitId={getAdUnitId("banner")} // using banner unit id for the fallback
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log("[Ads] Inline Ad loaded");
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => console.error("Inline Ad Error:", error)}
      />
    </View>
  );
};

export default AdManager;
