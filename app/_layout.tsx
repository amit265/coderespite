import { isRunningInExpoGo } from "expo";
import * as Sentry from '@sentry/react-native';
import AsyncStorage from "../services/storage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Linking from "expo-linking";
import GlobalAlertComponent, { globalAlertRef } from "../components/shared/GlobalAlert";
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { Stack, SplashScreen } from 'expo-router';
import { requestTrackingPermission } from "../services/trackingInit";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Platform, StatusBar, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import { initializeMobileAds } from "../services/adInit";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ErrorFallback from "../components/ErrorFallback";
import { adConfigContext, allCoursesContext, favoritesContext, LevelContext, userDetailsContext, aiCreditsContext } from "../context/context";
import AdManager, { useRewardedAdLoader, GlobalSmartBanner } from "../services/AdManager";
import { getAdFreeRemainingMs } from "../services/adFreeService";
import { getUserData, setUserData } from "../services/userStorage";
import './global.css';
import { EmojiText } from "../constants/constants";
import { useUpdateChecker } from "../hooks/useUpdateChecker";
import { initNotifications } from "../services/notificationService";
import UpdateModal from "../components/UpdateModal";
import { getAiCredits } from "../services/aiCreditsService";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "",
  enableInExpoDevelopment: true,
  debug: false,
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "nunito": require("../assets/fonts/Poppins-Regular.ttf"),
    "nunito-bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "nunito-semiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "quicksand": require("../assets/fonts/Quicksand-Regular.ttf"),
    "quicksand-semiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "quicksand-bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    ...AntDesign.font,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  const [adConfig, setAdConfig] = useState({
    showAds: true,
    showInterstitialAds: true,
    showAppOpenAds: true,
    showNativeAds: true,
    showBannerAds: true,
    testAds: false,
    interstitialFrequency: 10,
    appOpenAdFrequency: 10
  });
  const [adsReady, setAdsReady] = useState(false);
  const [userData, setUserDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [clickCount, setClickCount] = useState(1);

  const { isLoaded: isRewardedLoaded, isEarnedReward, load: loadRewarded, show: showRewarded } = useRewardedAdLoader();
  const [onAdRewardSuccess, setOnAdRewardSuccess] = useState(null);

  useEffect(() => {
    if (!isRewardedLoaded) {
      loadRewarded();
    }
  }, [isRewardedLoaded, loadRewarded]);

  useEffect(() => {
    if (isEarnedReward && onAdRewardSuccess) {
      onAdRewardSuccess();
      setOnAdRewardSuccess(null);
    }
  }, [isEarnedReward, onAdRewardSuccess]);

  const [isAdFreeSessionActive, setIsAdFreeSessionActive] = useState(false);

  useEffect(() => {
    const checkAdFree = async () => {
      const ms = await getAdFreeRemainingMs();
      setIsAdFreeSessionActive(ms > 0);
    };
    checkAdFree();
    const interval = setInterval(checkAdFree, 1000);
    return () => clearInterval(interval);
  }, []);

  const showRewardedAd = useCallback((onSuccess) => {
    if (isRewardedLoaded) {
      setOnAdRewardSuccess(() => onSuccess);
      showRewarded();
    } else {
      import('../components/shared/GlobalAlert').then(({ CustomAlert }) => {
        CustomAlert.alert("Ad loading", "The rewarded video is still loading. Please try again in a few seconds.");
      });
      loadRewarded();
    }
  }, [isRewardedLoaded, showRewarded, loadRewarded]);

  const [favorites, setFavorites] = useState([]);
  const [aiCredits, setAiCredits] = useState(5);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem("favorites");
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load favorites", err);
      }
    };
    loadFavorites();
  }, []);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [selectedModule, setSelectedModule] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState([]);
  const [attemptedQuizData, setAttemptedQuizData] = useState([]);
  const [lastShownLevel, setLastShownLevel] = useState(1);
  const [levelLoading, setLevelLoading] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState(null);

  // Desty Studio guidelines hooks integration
  const { updateAvailable, changelog, remoteVersion, setUpdateAvailable } = useUpdateChecker();

  useEffect(() => {
    initNotifications();
  }, []);

  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === "web" && windowWidth > 850;
  const isTablet = Platform.OS !== "web" && windowWidth >= 768;

  const adConfigValue = useMemo(
    () => ({ adConfig, setAdConfig, clickCount, setClickCount, adsReady, isRewardedLoaded, showRewardedAd, isAdFreeSessionActive }),
    [clickCount, adConfig, adsReady, isRewardedLoaded, showRewardedAd, isAdFreeSessionActive]
  )
  const favoritesValue = useMemo(() => ({ favorites, setFavorites }), [favorites])


  const allCoursesValue = useMemo(() => ({ selectedLesson, setSelectedLesson, allCourses, setAllCourses, selectedCourse, setSelectedCourse, selectedModule, setSelectedModule, selectedQuiz, setSelectedQuiz, attemptedQuizData, setAttemptedQuizData, setUpdate, update }), [selectedLesson, update, allCourses, selectedCourse, selectedModule, selectedQuiz, attemptedQuizData])

  useEffect(() => {
    const loadLevel = async () => {
      try {
        const storedLevel = await AsyncStorage.getItem("lastShownLevel");

        if (storedLevel !== null) {
          setLastShownLevel(parseInt(storedLevel));
        }
      } catch (error) {
        console.error("Failed to load lastShownLevel", error);
      } finally {
        setLevelLoading(false);
      }
    };
    loadLevel();
  }, []);

  // Save to AsyncStorage when updated
  const updateLastShownLevel = async (level) => {
    try {
      await AsyncStorage.setItem("lastShownLevel", level.toString());
      setLastShownLevel(level);
    } catch (error) {
      console.error("Failed to save lastShownLevel", error);
    }
  };


  // Load user data initially
  useEffect(() => {
    const load = async () => {
      // Log app open to Firebase Analytics
      try {
        await analytics().logAppOpen();
      } catch (err) {
        console.log("Analytics error: ", err);
      }

      const data = await getUserData();

      setUserDataState(data);
      setLoading(false);
    };
    load();
  }, [update]);

  // Load AI credits on startup
  useEffect(() => {
    getAiCredits().then(setAiCredits);
  }, []);

  const refreshCredits = async () => {
    const c = await getAiCredits();
    setAiCredits(c);
  };

  const aiCreditsValue = useMemo(
    () => ({ credits: aiCredits, setCredits: setAiCredits, refreshCredits }),
    [aiCredits]
  );


  // Update AsyncStorage + context state
  const updateUser = async (updateOrValue) => {
    setUserDataState((prevData) => {
      const updated = typeof updateOrValue === 'function' ? updateOrValue({ ...prevData }) : updateOrValue;
      
      // Sync with AsyncStorage
      setUserData(updated).catch(err => console.error("Failed to sync user data:", err));
      
      return updated;
    });
  };

  // Expose helper methods
  const value = {
    userData,
    loading,
    updateUser,
    // Example methods you can call from anywhere
    gainXP: async (xp) => {
      await updateUser((data) => {
        if (!data.level) {
          data.level = {
            xp: 0,
            currentLevel: 1,
            nextLevelXP: 100, // Starting point for Level 1
          };
        }

        const xpTable = [0, 100, 200, 400, 700, 1000, 1400, 1800, 2200, 2600]; // index = currentLevel

        if (data.level.currentLevel >= 10) {
          data.level.xp = Math.min(data.level.xp + xp, data.level.nextLevelXP);
          return data;
        }

        data.level.xp += xp;

        while (
          data.level.currentLevel < 10 &&
          data.level.xp >= data.level.nextLevelXP
        ) {
          data.level.xp -= data.level.nextLevelXP;
          data.level.currentLevel += 1;
          data.level.nextLevelXP = xpTable[data.level.currentLevel] || 0;
        }

        return data;
      });
    }
    ,


    updateCourse: async (course, updates) => {
      await updateUser((data) => {
        if (!data.progress) {
          data.progress = {};
        }
        if (!data.progress[course]) {
          data.progress[course] = {
            attemptedQuizzes: [],
            flashcardsViewed: [],
            flashcardsLoved: [],
            completed: false,
            percentage: 0,
          };
        }

        data.progress[course] = {
          ...data.progress[course],
          ...updates,
        };

        return data;
      });
    },

    logActivity: async () => {
      const today = new Date().toISOString().split("T")[0];
      await updateUser((data) => {
        if (!data.activityLog) {
          data.activityLog = [];
        }
        data.activityLog.push(today);
        return data;
      });
    }

  };


  const checkConnection = useCallback(async () => {
    try {
      const { isConnected } = await Network.getNetworkStateAsync();
      setIsConnected(isConnected);
    } catch (error) {
      console.error('Error checking network status:', error);
    }
  }, []);



  useEffect(() => {

    checkConnection();
    const subscription = Network.addNetworkStateListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => subscription && subscription.remove();

  }, [checkConnection]);

  // Ask for ATT on iOS before initializing ads, then enable ad loading.
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let isMounted = true;

    const prepareAds = async () => {
      try {
        console.log("[Ads] Mobile Ads initialization started");

        if (Platform.OS === "ios") {
          await requestTrackingPermission();
        }

        await initializeMobileAds();
        console.log("[Ads] Mobile Ads initialized successfully");
      } catch (error) {
        console.error("Mobile Ads Init Error:", error);
      } finally {
        if (isMounted) {
          console.log("[Ads] Ads marked ready");
          setAdsReady(true);
        }
      }
    };

    prepareAds();

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded, fontError]);



  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!isConnected) {
    SplashScreen.hideAsync();
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffcccc' }}>
        <EmojiText style={{ color: '#ff0000', fontSize: 18, fontFamily: 'nunito-bold' }}>No Internet Connection 😢</EmojiText>
      </View>
    );
  }

  if (fontError) {
    console.error("Error loading fonts:", fontError);
    return null; // or show fallback UI
  }
  if (!fontsLoaded) return null;


  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Global Error:', error);
        console.error('Component Stack:', info.componentStack);
        // Log the error to an external service like Sentry or Firebase
      }}
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
        <adConfigContext.Provider value={adConfigValue}>
          <PaperProvider>
            <LevelContext.Provider value={{ levelLoading, lastShownLevel, setLastShownLevel, updateLastShownLevel }}>
              <aiCreditsContext.Provider value={aiCreditsValue}>
                <userDetailsContext.Provider value={value}>
                  <favoritesContext.Provider value={favoritesValue}>
                    <allCoursesContext.Provider value={allCoursesValue}>
                    <StatusBar backgroundColor="#CBE7F7" barStyle="dark-content" hidden={false} />
                    <AdManager />
                    <GlobalAlertComponent ref={globalAlertRef} />
                    <UpdateModal
                      visible={updateAvailable}
                      changelog={changelog}
                      remoteVersion={remoteVersion}
                      onClose={() => setUpdateAvailable(false)}
                    />
                    {Platform.OS === "web" ? (
                      isLargeScreen ? (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            backgroundColor: "#0C1D59",
                          }}
                        >
                          {/* Left: Promotional Side Panel */}
                          <View
                            style={{
                              flex: 1,
                              padding: 40,
                              justifyContent: "center",
                              alignItems: "flex-start",
                              maxWidth: 500,
                              borderRightWidth: 1,
                              borderRightColor: "#132F94",
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFA500",
                                fontSize: 32,
                                fontWeight: "bold",
                                fontFamily: "nunito-bold",
                                marginBottom: 16,
                              }}
                            >
                              CodeRespite 🐾
                            </Text>
                            <Text
                              style={{
                                color: "#FFFFFF",
                                fontSize: 16,
                                fontFamily: "nunito-semiBold",
                                marginBottom: 24,
                                lineHeight: 24,
                              }}
                            >
                              Refresh Your Tech Skills - Learn programming, coding interview preparation, and key tech concepts with interactive quizzes and flashcards!
                            </Text>

                            <Text
                              style={{
                                color: "#FFA500",
                                fontSize: 16,
                                fontWeight: "bold",
                                fontFamily: "nunito-bold",
                                marginBottom: 12,
                              }}
                            >
                              Key Benefits:
                            </Text>
                            <View style={{ gap: 10, marginBottom: 30 }}>
                              {[
                                "Learn coding concepts with your favorite Meowgrammer! 🐾",
                                "Practice HTML, CSS, JavaScript, React, and Git.",
                                "Unlock custom tests with our built-in Groq AI Quiz Generator! 🤖",
                                "Build a daily streak, earn XP, and level up! 🏆",
                                "Complete history logs to review and master previous mistakes.",
                              ].map((bullet, idx) => (
                                <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                  <Text style={{ color: "#FFA500", marginRight: 8, marginTop: 4 }}>●</Text>
                                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "nunito", lineHeight: 18 }}>
                                    {bullet}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            <Text
                              style={{
                                color: "rgba(255,255,255,0.5)",
                                fontSize: 12,
                                fontFamily: "monospace",
                                marginBottom: 12,
                              }}
                            >
                              Get CodeRespite on your mobile device:
                            </Text>
                            <View style={{ flexDirection: "row", gap: 6 }}>
                              <TouchableOpacity
                                onPress={() => Linking.openURL("https://destyastudio.com/products/code-respite")}
                                style={{
                                  backgroundColor: "#132F94",
                                  borderRadius: 10,
                                  paddingVertical: 10,
                                  paddingHorizontal: 16,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <Ionicons name="logo-android" size={18} color="white" />
                                <Text style={{ color: "white", fontSize: 13, fontWeight: "bold", fontFamily: "nunito-bold" }}>
                                  Google Play
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => Linking.openURL("https://destyastudio.com/products/code-respite")}
                                style={{
                                  backgroundColor: "#132F94",
                                  borderRadius: 10,
                                  paddingVertical: 10,
                                  paddingHorizontal: 16,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <Ionicons name="logo-apple" size={18} color="white" />
                                <Text style={{ color: "white", fontSize: 13, fontWeight: "bold", fontFamily: "nunito-bold" }}>
                                  App Store
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                                             {/* Right: Centered Mobile Simulator */}
                          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <View
                              style={{
                                width: "100%",
                                maxWidth: 480,
                                height: "95%",
                                maxHeight: 850,
                                borderRadius: 20,
                                overflow: "hidden",
                                backgroundColor: "#132F94",
                                shadowColor: "#000",
                                shadowOpacity: 0.3,
                                shadowRadius: 20,
                                elevation: 10,
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                <Stack screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
                              </View>
                              <GlobalSmartBanner />
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: "#0C1D59",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              width: "100%",
                              maxWidth: 480,
                              height: "95%",
                              maxHeight: 850,
                              borderRadius: 20,
                              overflow: "hidden",
                              backgroundColor: "#132F94",
                              shadowColor: "#000",
                              shadowOpacity: 0.3,
                              shadowRadius: 20,
                              elevation: 10,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Stack screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
                            </View>
                            <GlobalSmartBanner />
                          </View>
                        </View>
                      )
                    ) : (
                      <View style={{ flex: 1 }}>
                        <Stack screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
                        <GlobalSmartBanner />
                      </View>
                    )}
                    </allCoursesContext.Provider>
                  </favoritesContext.Provider>
                </userDetailsContext.Provider>
              </aiCreditsContext.Provider>
            </LevelContext.Provider>
          </PaperProvider>
        </adConfigContext.Provider>
        </QueryClientProvider>

      </SafeAreaProvider>
    </ErrorBoundary>


  ); // This will render everything under (tabs) or any other layout
}
