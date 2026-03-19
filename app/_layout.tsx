// app/_layout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { Stack } from 'expo-router';
import * as TrackingTransparency from 'expo-tracking-transparency';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Platform, StatusBar, Text, View } from 'react-native';
import MobileAds from "react-native-google-mobile-ads";
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorFallback from "../components/ErrorFallback";
import { adConfigContext, allCoursesContext, favoritesContext, LevelContext, userDetailsContext } from "../context/context";
import AdManager from "../services/AdManager";
import { getUserData, setUserData } from "../services/userStorage";
import './global.css';
import { useAppInitialization } from "../hooks/useAppInitialization";
import { Emoji } from "../constants/constants";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "nunito": require("../assets/fonts/Poppins-Regular.ttf"),
    "nunito-bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "nunito-semiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "quicksand": require("../assets/fonts/Quicksand-Regular.ttf"),
    "quicksand-semiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "quicksand-bold": require("../assets/fonts/Quicksand-Bold.ttf"),
  });

  const [adConfig, setAdConfig] = useState({
    showAds: true,
    showInterstitialAds: true,
    showAppOpenAds: true,
    showNativeAds: true,
    showBannerAds: true,
    testAds: true,
    interstitialFrequency: 10,
    appOpenAdFrequency: 10
  });
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

  const adConfigValue = useMemo(() => ({ adConfig, setAdConfig, clickCount, setClickCount }), [clickCount, setClickCount, adConfig])
  const favoritesValue = useMemo(() => ({ favorites, setFavorites }), [favorites])


  const allCoursesValue = useMemo(() => ({ selectedLesson, setSelectedLesson, allCourses, setAllCourses, selectedCourse, setSelectedCourse, selectedModule, setSelectedModule, selectedQuiz, setSelectedQuiz, attemptedQuizData, setAttemptedQuizData, setUpdate, update }), [selectedLesson, update, allCourses, selectedCourse, selectedModule, selectedQuiz, attemptedQuizData])

  // Restore App Initialization Logic
  const { isReady } = useAppInitialization();

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
  const updateUser = async (updateFn) => {
    const updated = updateFn({ ...userData });
    await setUserData(updated);
    setUserDataState(updated);
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

  // ✅ Initialize Mobile Ads with ATT request on iOS
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
        if (status === 'granted') {
          console.log('Tracking permission granted!');
        }
      }

      MobileAds()
        .initialize()
        .then(adapterStatuses => {
          console.log('Mobile Ads Initialized');
        })
        .catch(error => {
          console.error("Mobile Ads Init Error:", error);
        });
    })();
  }, []);



  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffcccc' }}>
        <Text style={{ color: '#ff0000', fontSize: 18, fontFamily: 'nunito-bold' }}>No Internet Connection <Emoji>😢</Emoji></Text>
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
        console.log('Global Error:', error);
        console.log('Component Stack:', info.componentStack);
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
