import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import SplashScreenComponent from "../components/SplashScreenComponent";
import { useAppInitialization } from "../hooks/useAppInitialization";
import { useGlobalRefresh } from "../hooks/useGlobalRefresh";

const { width, height } = Dimensions.get("window");
export default function Index() {
  const router = useRouter();

  const { isReady, showCustomSplash } = useAppInitialization();
  const { refreshData, refreshing } = useGlobalRefresh();

  console.log("App Initialization Ready:", isReady);
  console.log("Global Refreshing:", refreshing);

  useEffect(() => {
    const fetchData = async () => {
      await refreshData(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Navigate to main app after a short delay to show readiness
      setTimeout(() => {
        router.replace("(tabs)");
      }, 500); // 0.5 second delay
    }
  }, []);

  if (showCustomSplash) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeScreen>
      <View className="h-2/3">
        <View className="flex-1 flex-col gap-10">
          <Image source={require("../assets/images/visual-picture.png")} />

          {!isReady && (
            <View
              style={{
                position: "absolute",
                top: height / 2 + 250, // Half of screen - half of Lottie height
                left: width / 2 - 175, // Half of screen - half of Lottie width
              }}
            >
              <LottieView
                source={require("../assets/paw.json")}
                autoPlay
                loop
                style={{
                  height: 150,
                  width: 160,
                  transform: [{ rotate: "45deg" }],
                }}
              />
            </View>
          )}
        </View>
      </View>
      <View className="flex flex-col h-1/3 -mt-12">
        <Text className="text-black text-2xl font-quicksand-bold text-center mt-2">
          Welcome to CodeRespite!
        </Text>
        <Text className="text-gray-800 text-base font-quicksand text-center mt-2 mx-8">
          Learn to code with your favorite Meowgrammer! 🐾
        </Text>

        {!isReady && (
          <View className="rounded-lg mx-auto flex flex-col justify-center items-center -mt-14">
            <LottieView
              source={require("../assets/cat.json")}
              autoPlay
              loop
              style={{
                height: 100,
                width: 100,
                backgroundColor: "Red",
                marginBottom: -15,
              }}
            />

            <Button
              text={"Let's Start!"}
              onPress={() => {
                router.replace("(tabs)");
              }}
            />
          </View>
        )}
      </View>
      {isReady && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            backgroundColor: "rgba(0, 0, 0, 0.2)",

            top: -50,
            left: -50,
            right: -50,
          }}
        >
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{
              height: 200,
              width: 200,
            }}
          />
        </View>
      )}
    </SafeScreen>
  );
}
