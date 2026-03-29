import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform, View } from "react-native";
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
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export const BannerAdComponent = ({ fixed = false }) => {
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
  const { adConfig, adsReady } = useContext(adConfigContext);

  if (!adsReady || !adConfig.showAds || !adConfig.showNativeAds) return null;

  return (
    <NativeAdView
      adUnitID={getAdUnitId("nativeAdvanced")}
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
      onAdLoaded={() => console.log("[Ads] Native ad loaded")}
      onAdFailedToLoad={(err) => console.error("Native Ad Load Error", err)}
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
