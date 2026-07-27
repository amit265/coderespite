// app/_layout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { Stack, SplashScreen } from 'expo-router';
import { requestTrackingPermission } from "../services/trackingInit";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Platform, StatusBar, View, Text, TouchableOpacity, Linking } from 'react-native';
import { initializeMobileAds } from "../services/adInit";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ErrorFallback from "../components/ErrorFallback";
import { adConfigContext, allCoursesContext, favoritesContext, LevelContext, userDetailsContext } from "../context/context";
import AdManager from "../services/AdManager";
import { getUserData, setUserData } from "../services/userStorage";
import './global.css';
import { EmojiText } from "../constants/constants";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
  const [favorites, setFavorites] = useState([]);
  const [clickCount, setClickCount] = useState(1);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [selectedModule, setSelectedModule] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState([]);
  const [attemptedQuizData, setAttemptedQuizData] = useState([]);
  const [lastShownLevel, setLastShownLevel] = useState(1);
  const [levelLoading, setLevelLoading] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const adConfigValue = useMemo(
    () => ({ adConfig, setAdConfig, clickCount, setClickCount, adsReady }),
    [clickCount, adConfig, adsReady]
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
      const data = await getUserData();

      setUserDataState(data);
      setLoading(false);
    };
    load();
  }, [update]);


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
        <adConfigContext.Provider value={adConfigValue}>
          <PaperProvider>
            <LevelContext.Provider value={{ levelLoading, lastShownLevel, setLastShownLevel, updateLastShownLevel }}>

              <userDetailsContext.Provider value={value}>
                <favoritesContext.Provider value={favoritesValue}>
                  <allCoursesContext.Provider value={allCoursesValue}>
                    <StatusBar backgroundColor="#CBE7F7" barStyle="dark-content" hidden={false} />
                    <AdManager />
                    {Platform.OS === "web" ? (
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#0C1D59",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 20,
                          flexWrap: "wrap",
                          gap: 40,
                        }}
                      >
                        {/* Desktop Web Landing & Promotion Panel */}
                        <View style={{ maxWidth: 400, padding: 20 }}>
                          <Text style={{ fontSize: 36, color: "#fff", fontFamily: "quicksand-bold", marginBottom: 12 }}>
                            CodeRespite 🐾
                          </Text>
                          <Text style={{ fontSize: 16, color: "#cbd5e1", fontFamily: "nunito", marginBottom: 24, lineHeight: 24 }}>
                            Refresh your coding skills on the go! Master JavaScript, React Native, Python, Web Development, and prepare for tech interviews with interactive quizzes and flashcards.
                          </Text>
                          <Text style={{ fontSize: 14, color: "#fbbf24", fontFamily: "nunito-bold", marginBottom: 12 }}>
                            📲 Available now for Android & iOS:
                          </Text>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                            <TouchableOpacity
                              onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=com.mindcraftlearning.coderespite")}
                              style={{
                                backgroundColor: "#1e293b",
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#334155",
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 13, fontFamily: "nunito-bold" }}>Get it on Google Play</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => Linking.openURL("https://apps.apple.com/app/id6760843431")}
                              style={{
                                backgroundColor: "#1e293b",
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#334155",
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 13, fontFamily: "nunito-bold" }}>Download on App Store</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Mobile Simulator Frame */}
                        <View
                          style={{
                            width: "100%",
                            maxWidth: 480,
                            height: "90%",
                            minHeight: 700,
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
                          <SafeAreaView style={{ flex: 1 }}>
                            <Stack screenOptions={{ headerShown: false }} />
                          </SafeAreaView>
                        </View>
                      </View>
                    ) : (
                      <SafeAreaView style={{ flex: 1 }}>
                        <Stack screenOptions={{ headerShown: false }} />
                      </SafeAreaView>
                    )}
                  </allCoursesContext.Provider>
                </favoritesContext.Provider>
              </userDetailsContext.Provider>
            </LevelContext.Provider>
          </PaperProvider>
        </adConfigContext.Provider>

      </SafeAreaProvider>
    </ErrorBoundary>


  ); // This will render everything under (tabs) or any other layout
}
