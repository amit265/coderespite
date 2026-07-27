import React from "react";

// Web Mock AdManager
const AdManager = () => {
  return null;
};

export const showInterstitialAd = (adConfig) => {
  console.log("[AdManager.web] Mock Interstitial requested");
};

export const BannerAdComponent = ({ fixed = false }) => {
  console.log("[AdManager.web] Mock Banner rendered");
  return null;
};

export const NativeAdComponent = () => {
  console.log("[AdManager.web] Mock Native Ad rendered");
  return null;
};

export default AdManager;
