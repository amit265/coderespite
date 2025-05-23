import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Text, View } from "react-native";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import SplashScreenComponent from "../components/SplashScreenComponent";
import { allCoursesContext, userDetailsContext } from "../context/context";
import { getAllCoursesWithSubcollections } from "../services/getAllCoursesWithSubcollections";
const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(true);
  const { allCourses, setAllCourses, update, setUpdate } =
    useContext(allCoursesContext);
  const { userData, updateUser } = useContext(userDetailsContext);

  const loadData = async () => {
    try {
      await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        updateUser(JSON.parse(storedUser));
      }
      const storedCourses = await AsyncStorage.getItem("@allCourses_data");

      if (storedCourses) {
        setAllCourses(JSON.parse(storedCourses));
      } else {
        const freshData = await getAllCoursesWithSubcollections();
        setAllCourses(freshData); // update context
        await AsyncStorage.setItem(
          "@allCourses_data",
          JSON.stringify(freshData)
        ); // cache for future
      }
    } catch (error) {
      console.error("❌ Error loading AsyncStorage: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect( () => {
    const fetch = async () => {
      await loadData();
    };
    fetch();
  }, [update]);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading fonts/assets
        loadData();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // ✅ Hide the native splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    // Show custom splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreenComponent />;
  }

  // console.log("allCourses from context", allCourses);

  return (
    <SafeScreen>
      <View className="h-2/3">
        <View className="flex-1 flex-col gap-10">
          <Image source={require("../assets/images/visual-picture.png")} />

          <View
            style={{
              position: "absolute",
              top: height / 2 + 170, // Half of screen - half of Lottie height
              left: width / 2 - 55, // Half of screen - half of Lottie width
            }}
          >
            <LottieView
              source={require("../assets/cat.json")}
              autoPlay
              loop
              style={{
                height: 100,
                width: 100,
              }}
            />
          </View>
          <View
            style={{
              position: "absolute",
              top: 110, // Half of screen - half of Lottie height
              right: -50,
            }}
          >
            {/* <LottieView
              source={require("../assets/paw.json")}
              autoPlay
              loop={false} 
              style={{
                height: 500,
                width: 600,
                transform: [{ rotate: "-45deg" }],
              }}
            /> */}
          </View>
        </View>
      </View>
      <View className="h-1/3">
        <Text className="text-black text-2xl font-quicksand-bold text-center mt-2">
          Welcome to CodeRespite!
        </Text>
        <Text className="text-gray-800 text-base font-quicksand text-center mt-2 mx-8">
          Learn to code with your favorite Meowgrammer! 🐾
        </Text>
        <View className="rounded-lg mt-12 mx-auto">
          <Button
            text={"Let's Start!"}
            loading={loading}
            onPress={() => {
              router.replace("(tabs)");
            }}
          />
        </View>
      </View>
      {loading && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -18 }, { translateY: -18 }],
          }}
        >
          <ActivityIndicator color="black" size={36} />
        </View>
      )}
    </SafeScreen>
  );
}
