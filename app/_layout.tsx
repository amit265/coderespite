// app/_layout.tsx
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { user } from "../constants/constants";
import { allCoursesContext, favoritesContext, userDetailsContext } from "../context/context";
import './global.css';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from "../components/ErrorFallback";

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
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
  const [userDetails, setUserDetails] = useState(user);


  const [dbUpdate, setUpdate] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [clickCount, setClickCount] = useState(1);
  const [questionData, setQuestionData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [selectedModule, setSelectedModule] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState([]);



  const dbUpdateValue = useMemo(() => ({ dbUpdate, setUpdate }), [dbUpdate]);
  const adConfigValue = useMemo(() => ({ adConfig, setAdConfig, clickCount, setClickCount }), [clickCount, setClickCount, adConfig])
  const settingModalValue = useMemo(() => ({ settingsModalVisible, setSettingsModalVisible }), [settingsModalVisible])
  const questionDataValue = useMemo(() => ({ questionData, setQuestionData }), [questionData])
  const favoritesValue = useMemo(() => ({ favorites, setFavorites }), [favorites])
  const allCoursesValue = useMemo(() => ({ allCourses, setAllCourses, selectedCourse, setSelectedCourse, selectedModule, setSelectedModule, selectedQuiz, setSelectedQuiz }), [allCourses, selectedCourse, selectedModule, selectedQuiz])
  const userDetailsValue = useMemo(() => ({ userDetails, setUserDetails }), [userDetails])


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

  }, []);


  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffcccc' }}>
        <Text style={{ color: '#ff0000', fontSize: 18, fontFamily: 'nunito-bold' }}>No Internet Connection 😢</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }

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
          <userDetailsContext.Provider value={userDetailsValue}>
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
