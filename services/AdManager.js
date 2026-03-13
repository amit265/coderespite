import React, { useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform, View, StyleSheet } from "react-native";
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
import colors from "../constants/colors";

// ✅ Helper to get ad unit IDs based on platform and test mode
const getAdUnitId = (type, testAds) => {
  const adUnitIds = {
    banner: {
      android: testAds
        ? TestIds.ADAPTIVE_BANNER
        : "ca-app-pub-7433519007687449/9531365889",
      ios: testAds
        ? TestIds.ADAPTIVE_BANNER
        : "ca-app-pub-7433519007687449/5570092969",
    },
    interstitial: {
      android: testAds
        ? TestIds.INTERSTITIAL
        : "ca-app-pub-7433519007687449/7195403622",
      ios: testAds
        ? TestIds.INTERSTITIAL
        : "ca-app-pub-7433519007687449/7733221875",
    },
    appOpen: {
      android: testAds
        ? TestIds.APP_OPEN
        : "ca-app-pub-7433519007687449/6961042869",
      ios: testAds
        ? TestIds.APP_OPEN
        : "ca-app-pub-7433519007687449/1274315229",
    },
    nativeAdvanced: {
      android: testAds
        ? TestIds.NATIVE
        : "ca-app-pub-7433519007687449/3505013580",
      ios: testAds ? TestIds.NATIVE : "ca-app-pub-7433519007687449/8227570532",
    },
  };

  return Platform.select({
    ios: adUnitIds[type].ios,
    android: adUnitIds[type].android,
    default: adUnitIds[type].android,
  });
};

// ✅ Ad references
let interstitialAd;
let appOpenAd;

const AdManager = () => {
  const { adConfig, clickCount } = useContext(adConfigContext);

  let interstitialJustShown = false;
  const appPauseCount = useRef(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !interstitialJustShown) {
        appPauseCount.current += 1;

        if (
          appPauseCount.current % adConfig?.appOpenAdFrequency === 0 &&
          adConfig.showAppOpenAds &&
          appOpenAd?.loaded
        ) {
          appOpenAd.show();
        }
      }
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
      showInterstitialAd(adConfig);
    }
  }, [clickCount, adConfig]);

  useEffect(() => {
    loadAds(adConfig);
  }, [adConfig]);

  let isRewardedAdLoading = false;
  const loadAds = (config) => {
    if (isRewardedAdLoading) return;

    isRewardedAdLoading = true;
    setTimeout(() => (isRewardedAdLoading = false), 5000);

    interstitialAd = InterstitialAd.createForAdRequest(
      getAdUnitId("interstitial", config.testAds),
    );
    appOpenAd = AppOpenAd.createForAdRequest(
      getAdUnitId("appOpen", config.testAds),
    );

    interstitialAd.addAdEventListener(AdEventType.LOADED, () =>
      console.log("Interstitial Ad Loaded!"),
    );
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialJustShown = true;
      interstitialAd.load();
    });

    interstitialAd.load();

    appOpenAd.addAdEventListener(AdEventType.LOADED, () =>
      console.log("App Open Ad Loaded!"),
    );
    appOpenAd.addAdEventListener(AdEventType.CLOSED, () =>
      setTimeout(() => appOpenAd.load(), 3000),
    );

    appOpenAd.load();
  };

  return null;
};

export const showInterstitialAd = (adConfig) => {
  if (interstitialAd?.loaded && adConfig.showInterstitialAds) {
    interstitialAd.show();
    interstitialAd.load();
  } else {
    interstitialAd?.load();
  }
};

export const BannerAdComponent = ({ fixed = false }) => {
  const insets = useSafeAreaInsets();
  const { adConfig } = useContext(adConfigContext);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (!adConfig.showBannerAds) return null;

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
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: insets.bottom,
      zIndex: 1000,
    },
    !fixed && {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10
    }
  ];

  return (
    <View style={containerStyle}>
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
        // iOS Shadows
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
