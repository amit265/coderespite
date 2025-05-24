// app/_layout.tsx
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorFallback from "../components/ErrorFallback";
import { allCoursesContext, favoritesContext, userDetailsContext } from "../context/context";
import { getUserData, setUserData } from "../services/userStorage";
import './global.css';
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "nunito": require("../assets/fonts/Nunito-Regular.ttf"),
    "nunito-bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "nunito-semiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "quicksand": require("../assets/fonts/Quicksand-Regular.ttf"),
    "quicksand-semiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "quicksand-bold": require("../assets/fonts/Quicksand-Bold.ttf"),
  });

  const [adConfig, setAdConfig] = useState({
    showAds: true,
    showInterstitialAds: true,
    showAppOpenAds: true,
    showRewardedAds: true,
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



  const adConfigValue = useMemo(() => ({ adConfig, setAdConfig, clickCount, setClickCount }), [clickCount, setClickCount, adConfig])
  const favoritesValue = useMemo(() => ({ favorites, setFavorites }), [favorites])


  const allCoursesValue = useMemo(() => ({ allCourses, setAllCourses, selectedCourse, setSelectedCourse, selectedModule, setSelectedModule, selectedQuiz, setSelectedQuiz, attemptedQuizData, setAttemptedQuizData, setUpdate, update }), [update, allCourses, selectedCourse, selectedModule, selectedQuiz, attemptedQuizData])
  const userDetailsValue = useMemo(() => ({ userData, setUserDataState }), [userData])



  // Load user data initially
  useEffect(() => {
    const load = async () => {
      const data = await getUserData();
      console.log("data from first layout", data);

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
        data.level.xp += xp;
        while (data.level.xp >= data.level.nextLevelXP) {
          data.level.xp -= data.level.nextLevelXP;
          data.level.currentLevel += 1;
          data.level.nextLevelXP += 100;
        }
        return data;
      });
    },
    updateCourse: async (course, updates) => {
      await updateUser((data) => {
        if (!data.progress) {
          data.progress = {};
        }
        if (!data.progress[course]) {
          data.progress[course] = {
            attemptedQuizzes: [],
            flashcardsLoved: 0,
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


  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffcccc' }}>
        <Text style={{ color: '#ff0000', fontSize: 18, fontFamily: 'nunito-bold' }}>No Internet Connection 😢</Text>
      </View>
    );
  }

  if (fontError) {
    console.error("Error loading fonts:", fontError);
    return null; // or show fallback UI
  }
  if (!fontsLoaded) return null;


  return (
    <>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, info) => {
          console.log('Global Error:', error);
          console.log('Component Stack:', info.componentStack);
          // Log the error to an external service like Sentry or Firebase
        }}
      >
        <SafeAreaProvider>
          <userDetailsContext.Provider value={value}>
            <favoritesContext.Provider value={favoritesValue}>
              <allCoursesContext.Provider value={allCoursesValue}>
                <StatusBar backgroundColor="#CBE7F7" barStyle="dark-content" hidden={false} />
                <Stack screenOptions={{ headerShown: false }} />
              </allCoursesContext.Provider>
            </favoritesContext.Provider>
          </userDetailsContext.Provider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </>


  ); // This will render everything under (tabs) or any other layout
}
