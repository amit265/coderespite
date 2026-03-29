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
import * as TrackingTransparency from 'expo-tracking-transparency';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Platform, StatusBar, View } from 'react-native';
import MobileAds from "react-native-google-mobile-ads";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
        if (Platform.OS === "ios") {
          await TrackingTransparency.getTrackingPermissionsAsync();
          await TrackingTransparency.requestTrackingPermissionsAsync();
        }

        await MobileAds().initialize();
      } catch (error) {
        console.error("Mobile Ads Init Error:", error);
      } finally {
        if (isMounted) {
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
                    <Stack screenOptions={{ headerShown: false }} />
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
