import { SplashScreen, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SafeScreen from "../components/SafeScreen";
import SplashScreenComponent from "../components/SplashScreenComponent";
import colors from "../constants/colors";
const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading fonts/assets
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

  return (
    <SafeScreen>
      <View className="h-2/3">
        <View className="flex-1 flex-col gap-10">
          <Image source={require("../assets/images/visual-picture.png")} />

          <View
            style={{
              position: "absolute",
              top: height / 2 + 155, // Half of screen - half of Lottie height
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
        <Text className="text-black text-2xl font-bold text-center mt-2">
          Welcome to CodeRespite!
        </Text>
        <Text className="text-gray-800 text-base text-center mt-2 mx-8">
          Learn to code with your favorite Meowgrammer! 🐾
        </Text>
        <Pressable
          onPress={() => {
            router.replace("(tabs)");
          }}
          className="bg-red-600 px-6 py-3 rounded-lg mt-12 mx-auto"
        >
          <Text className="text-white text-lg font-semibold">
            Let&apos;s Start!
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND || "#fff",
  },
  animation: {
    width,
    height,
  },
});
