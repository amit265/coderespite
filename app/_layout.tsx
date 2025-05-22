// app/_layout.tsx
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { user } from "../constants/constants";
import { allCoursesContext, favoritesContext, userDetailsContext } from "../context/context";
import './global.css';
export default function RootLayout() {


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

  return (
    <>
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

    </>


  ); // This will render everything under (tabs) or any other layout
}
