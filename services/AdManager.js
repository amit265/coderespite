import React, { useContext, useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import {
  AdEventType,
  AdvertiserView,
  AppOpenAd,
  BannerAd,
  BannerAdSize,
  CallToActionView,
  HeadlineView,
  IconView,
  InterstitialAd,
  MediaView,
  NativeAdView,
  StarRatingView,
  TaglineView,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { adConfigContext } from "../context/context";

// ✅ Helper to get ad unit IDs based on test mode
const getAdUnitId = (type, testAds) => {
  const adUnitIds = {
    banner: testAds
      ? TestIds.ADAPTIVE_BANNER
      : "ca-app-pub-7433519007687449/9531365889",
    interstitial: testAds
      ? TestIds.INTERSTITIAL
      : "ca-app-pub-7433519007687449/7195403622",
    appOpen: testAds
      ? TestIds.APP_OPEN
      : "ca-app-pub-7433519007687449/6961042869",
    nativeAdvanced: testAds
      ? TestIds.NATIVE
      : "ca-app-pub-7433519007687449/3505013580",
  };
  return adUnitIds[type];
};

// ✅ Ad references
let interstitialAd;
let appOpenAd;

const AdManager = () => {
  const { adConfig, clickCount } = useContext(adConfigContext);
  // console.log("adconfig", adConfig);

  let interstitialJustShown = false;
  const appPauseCount = useRef(0); // ✅ Track app pause count

  // ✅ Handle app state changes for open app ads
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !interstitialJustShown) {
        // ✅ Increment pause count
        appPauseCount.current += 1;

        // console.log(`App Resume Count: ${appPauseCount.current}`);

        // ✅ Show AppOpenAd every second pause
        if (
          appPauseCount.current % adConfig?.appOpenAdFrequency === 0 && // Show ad every second pause
          adConfig.showAppOpenAds &&
          appOpenAd?.loaded
        ) {
          console.log("Showing App Open Ad");
          appOpenAd.show();
        }
      }

      // ✅ Ensure interstitial doesn't interfere with counting
      interstitialJustShown = false;
    });

    return () => subscription.remove();
  }, [adConfig]);

  useEffect(() => {
    if (
      clickCount > 0 &&
      adConfig?.showInterstitialAds &&
      adConfig?.interstitialFrequency &&
      clickCount % adConfig?.interstitialFrequency === 0
    ) {
      // console.log("Showing interstitial ad at clickCount", clickCount);
      showInterstitialAd(adConfig);
    }
  }, [clickCount, adConfig]);

  // ✅ Load ads when config changes
  useEffect(() => {
    loadAds(adConfig);
  }, [adConfig]);

  // ✅ Load Ads
  let isRewardedAdLoading = false;
  const loadAds = (config) => {
    if (isRewardedAdLoading) return;

    // console.log("Loading Ads with config:", config);

    isRewardedAdLoading = true;
    setTimeout(() => (isRewardedAdLoading = false), 5000);

    // ✅ Create ads with updated ad unit IDs
    interstitialAd = InterstitialAd.createForAdRequest(
      getAdUnitId("interstitial", config.testAds)
    );
    appOpenAd = AppOpenAd.createForAdRequest(
      getAdUnitId("appOpen", config.testAds)
    );

    // ✅ Interstitial Ad
    interstitialAd.addAdEventListener(AdEventType.LOADED, () =>
      console.log("Interstitial Ad Loaded!")
    );
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialJustShown = true;
      interstitialAd.load();
    });

    interstitialAd.load();

    // ✅ App Open Ad
    appOpenAd.addAdEventListener(AdEventType.LOADED, () =>
      console.log("App Open Ad Loaded!")
    );
    appOpenAd.addAdEventListener(AdEventType.CLOSED, () =>
      setTimeout(() => appOpenAd.load(), 3000)
    );

    appOpenAd.load();
  };

  return null;
};

// ✅ Functions to Show Ads
export const showInterstitialAd = (adConfig) => {
  if (interstitialAd?.loaded && adConfig.showInterstitialAds) {
    interstitialAd.show();
    interstitialAd.load();
  } else {
    console.log("Interstitial Ad not ready");
    interstitialAd.load();
  }
};

// ✅ Banner Ad Component
export const BannerAdComponent = () => {
  const insets = useSafeAreaInsets();

  const { adConfig } = useContext(adConfigContext);

  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (!adConfig.showBannerAds) return null;

  return (
    <View
      style={{
        opacity: isAdLoaded ? 1 : 0,
        height: isAdLoaded ? undefined : 0,
        paddingBottom: insets.bottom,
      }}
    >
      <BannerAd
        unitId={getAdUnitId("banner", adConfig.testAds)}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setIsAdLoaded(true)}
        onAdFailedToLoad={(error) => console.error("Banner Ad Error:", error)}
      />
    </View>
  );
};

export const NativeAdComponent = () => {
  const { adConfig } = useContext(adConfigContext);

  if (!adConfig.showNativeAds) return null;

  return (
    <NativeAdView
      adUnitID={getAdUnitId("nativeAdvanced", adConfig?.testAds)}
      style={{
        width: "100%",
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#fff",
        elevation: 2,
      }}
      onAdLoaded={() => console.log("Native Ad Loaded")}
      onAdFailedToLoad={(err) => console.log("Native Ad Load Error", err)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconView style={{ width: 60, height: 60, borderRadius: 10 }} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <HeadlineView style={{ fontSize: 16, fontWeight: "bold" }} />
          <TaglineView style={{ fontSize: 14, color: "gray" }} />
          <AdvertiserView style={{ fontSize: 12, color: "gray" }} />
          <StarRatingView style={{ marginTop: 4 }} />
        </View>
      </View>
      <MediaView style={{ width: "100%", height: 180, marginVertical: 10 }} />
      <CallToActionView
        style={{
          backgroundColor: "#4285F4",
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
        }}
        textStyle={{
          color: "white",
          fontWeight: "bold",
          fontSize: 16,
        }}
      />
    </NativeAdView>
  );
};

export default AdManager;
