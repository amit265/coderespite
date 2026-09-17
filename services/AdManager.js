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
  useRewardedAd,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSegments } from "expo-router";
import { adConfigContext } from "../context/context";
import colors from "../constants/colors";

const adUnits = {
  banner: {
    android: "ca-app-pub-7433519007687449/9531365889",
    ios: "ca-app-pub-7433519007687449/5570092969",
  },
  interstitial: {
    android: "ca-app-pub-7433519007687449/7195403622",
    ios: "ca-app-pub-7433519007687449/7733221875",
  },
  appOpen: {
    android: "ca-app-pub-7433519007687449/6961042869",
    ios: "ca-app-pub-7433519007687449/1274315229",
  },
  nativeAdvanced: {
    android: "ca-app-pub-7433519007687449/3505013580",
    ios: "ca-app-pub-7433519007687449/8227570532",
  },
  rewarded: {
    android: "ca-app-pub-7433519007687449/1432138727",
    ios: "ca-app-pub-7433519007687449/2375528619",
  },
};


const testAdUnits = {
  banner: {
    android: "ca-app-pub-3940256099942544/6300978111",
    ios: "ca-app-pub-3940256099942544/2934735716",
  },
  interstitial: {
    android: "ca-app-pub-3940256099942544/1033173712",
    ios: "ca-app-pub-3940256099942544/4411468910",
  },
  appOpen: {
    android: "ca-app-pub-3940256099942544/9257395921",
    ios: "ca-app-pub-3940256099942544/5575463023",
  },
  nativeAdvanced: {
    android: "ca-app-pub-3940256099942544/2247696110",
    ios: "ca-app-pub-3940256099942544/3986624511",
  },
  rewarded: {
    android: "ca-app-pub-3940256099942544/5224354917",
    ios: "ca-app-pub-3940256099942544/1712485313",
  },
};

const getAdUnitId = (type) => {
  const isDev = __DEV__;
  const targetUnits = isDev ? testAdUnits : adUnits;
  
  return Platform.select({
    ios: targetUnits[type].ios,
    android: targetUnits[type].android,
    default: targetUnits[type].android,
  });
};

// ✅ Ad references
let interstitialAd;
let appOpenAd;

const AdManager = () => {
  const { adConfig, clickCount, adsReady, isAdFreeSessionActive } = useContext(adConfigContext);
  const interstitialJustShown = useRef(false);
  const appPauseCount = useRef(0);

  useEffect(() => {
    if (!adsReady || !adConfig?.showAds) return;

    console.log("[Ads] App state listener active");

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !interstitialJustShown.current) {
        appPauseCount.current += 1;

        if (isAdFreeSessionActive) {
          console.log("[Ads] Ad-free session active - skipping app open ad.");
          interstitialJustShown.current = false;
          return;
        }

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
  }, [adConfig, adsReady, isAdFreeSessionActive]);

  useEffect(() => {
    if (!adsReady || !adConfig?.showAds) return;

    if (
      clickCount > 0 &&
      adConfig?.showInterstitialAds &&
      adConfig?.interstitialFrequency &&
      clickCount % adConfig?.interstitialFrequency === 0
    ) {
      if (isAdFreeSessionActive) {
        console.log("[Ads] Ad-free session active - skipping interstitial.");
        return;
      }
      showInterstitialAd(adConfig);
    }
  }, [clickCount, adConfig, adsReady, isAdFreeSessionActive]);

  useEffect(() => {
    if (!adsReady || !adConfig?.showAds) return;

    interstitialAd = InterstitialAd.createForAdRequest(getAdUnitId("interstitial"));
    appOpenAd = AppOpenAd.createForAdRequest(getAdUnitId("appOpen"));

    const unsubI1 = interstitialAd.addAdEventListener(AdEventType.LOADED, () => console.log("[Ads] Interstitial loaded"));
    const unsubI2 = interstitialAd.addAdEventListener(AdEventType.OPENED, () => console.log("[Ads] Interstitial opened"));
    const unsubI3 = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("[Ads] Interstitial closed, reloading");
      interstitialJustShown.current = true;
      interstitialAd.load();
    });
    const unsubI4 = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => console.error("[Ads] Interstitial error", error));

    const unsubA1 = appOpenAd.addAdEventListener(AdEventType.LOADED, () => console.log("[Ads] App open ad loaded"));
    const unsubA2 = appOpenAd.addAdEventListener(AdEventType.OPENED, () => console.log("[Ads] App open ad opened"));
    const unsubA3 = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      setTimeout(() => {
        console.log("[Ads] App open ad closed, reloading");
        appOpenAd.load();
      }, 3000);
    });
    const unsubA4 = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => console.error("[Ads] App open ad error", error));

    interstitialAd.load();
    appOpenAd.load();

    return () => {
      unsubI1(); unsubI2(); unsubI3(); unsubI4();
      unsubA1(); unsubA2(); unsubA3(); unsubA4();
    };
  }, [adConfig?.showAds, adsReady]);

  return null;
};

export const showInterstitialAd = (adConfig) => {
  if (interstitialAd?.loaded && adConfig.showAds && adConfig.showInterstitialAds) {
    console.log("[Ads] showInterstitialAd invoked: showing interstitial");
    interstitialAd.show();
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

export const useRewardedAdLoader = () => {
  const unitId = getAdUnitId("rewarded");
  return useRewardedAd(unitId, {
    requestNonPersonalizedAdsOnly: true,
  });
};

export const BannerAdComponent = ({ fixed = false }) => {
  const context = useContext(adConfigContext);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  if (!adConfigContext || !adConfigContext.Provider || !context) return null;
  
  const { adConfig, adsReady, isAdFreeSessionActive } = context;

  if (!adsReady || !adConfig.showAds || !adConfig.showBannerAds || isAdFreeSessionActive) return null;

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

export const GlobalSmartBanner = () => {
  const segments = useSegments();
  
  const mainTabs = ["index", "courses", "practice", "profile"];
  const isMainTab = segments.length > 0 && segments[0] === "(tabs)" && mainTabs.includes(segments[1] || "index");
  
  if (isMainTab) return null;

  return (
    <View style={{ width: '100%' }}>
      <BannerAdComponent fixed={false} />
    </View>
  );
};

export const NativeAdComponent = () => {
  const contextValues = useContext(adConfigContext);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (!adConfigContext || !adConfigContext.Provider || !contextValues) {
    return null;
  }
  
  const { adConfig, adsReady } = contextValues;

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
