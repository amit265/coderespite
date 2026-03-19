import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // import your db

const appsData = require("../assets/appData.json");

// const appConfigPayload = {
//   enableMatchMode: true,
//   enableAI: true,
//   categoriesEnabled: [],
//   themeConfig: {
//     primaryGradient: ["#2B1633", "#A3327A", "#FF7E6B"],
//     accentGradient: ["#F65B7A", "#FDBB6A"],
//     surface: "#1F1330",
//     cardBackground: "rgba(255, 255, 255, 0.12)",
//     textPrimary: "#FFF8FB",
//     textSecondary: "#F0D7E0",
//     textInverted: "#5B1743",
//     buttonBackground: "#FFF0F5",
//     buttonText: "#5B1743",
//     categoryGradients: {},
//   },
//   contentConfig: defaultContentConfig,
//   adConfig: {
//     showAds: true,
//     showInterstitialAds: true,
//     showAppOpenAds: true,
//     showRewardedAds: true,
//     showBannerAds: true,
//     testAds: true,
//     interstitialFrequency: 10,
//     exploreInterstitialFrequency: 8,
//     soloPlayInterstitialFrequency: 6,
//     couplePlayInterstitialFrequency: 12,
//     appOpenAdFrequency: 10,
//     enableAdFreeCodes: false,
//     adFreeCodes: [],
//   },
//   aiPromptConfig: {
//     model: "llama-3.1-8b-instant",
//     systemPrompt: "You generate short, human follow-up questions.",
//     userPromptTemplate: [
//       "You are helping people have natural, comfortable conversations.",
//       "",
//       "Given this question:",
//       "\"{{question}}\"",
//       "",
//       "Reaction from the couple:",
//       "\"{{reaction}}\"",
//       "",
//       "Generate one follow-up question that:",
//       "- feels natural and human",
//       "- matches the reaction energy",
//       "- is slightly deeper but not emotional therapy",
//       "- avoids yes/no answers",
//       "- feels appropriate for two people connecting",
//       "",
//       "Output only the question. No explanations.",
//     ].join("\n"),
//     temperature: 0.7,
//     maxTokens: 40,
//     fallbackReaction: "curious",
//   },
//   celebrationConfig: {
//     enabled: false,
//     campaignId: "welcome-1",
//     title: "A little celebration for {{name}}",
//     message:
//       "You have already saved {{momentsCount}} moments, explored {{topicsCount}} topics, and unlocked {{questionsCount}} questions. Thanks for being here.",
//     primaryButtonText: "Continue",
//     secondaryButtonText: "Maybe Later",
//     audience: "all",
//     startAt: null,
//     endAt: null,
//   },
//   festivalModalConfig: {
//     enabled: false,
//     campaignId: "festival-1",
//     title: "Happy Holi, {{name}}",
//     message: "Wishing you color, warmth, and a day full of sweet conversations.",
//     imageUrl: null,
//     primaryButtonText: "Go to Questions",
//     secondaryButtonText: "Close",
//     audience: "all",
//     startAt: null,
//     endAt: null,
//   },
//   promoText: "Check out this amazing app for better conversations.",
//   appVersion: "1.0.1",
//   updatedAt: new Date().toISOString(),
// };


export const uploadAppData = async () => {
  try {
    const moreAppsRef = doc(db, "config", "moreApps");
    // const appConfigRef = doc(db, "config", "appConfig");
    const normalizedApps = Array.isArray(appsData)
      ? appsData.map((app) => ({
          name: app?.name || "",
          description: app?.description || "",
          icon: app?.icon || "",
          androidUrl: app?.androidUrl || "",
          iosUrl: app?.iosUrl || "",
          isAvailableOnIOS: Boolean(app?.isAvailableOnIOS),
          show: app?.show === true,
        }))
      : [];

    await setDoc(moreAppsRef, {
      apps: normalizedApps,
      updatedAt: new Date().toISOString(),
    });
    console.log(" Successfully updated moreApps in Firebase!");
    // await setDoc(appConfigRef, appConfigPayload, { merge: true });
    // console.log(" Successfully updated appConfig in Firebase!");
    
  } catch (error) {
    console.error(" Error updating Firebase:", error);
  }
};
