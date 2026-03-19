import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import SplashScreenComponent from "../components/SplashScreenComponent";
import { Emoji } from "../constants/constants";
import { useAppInitialization } from "../hooks/useAppInitialization";
import { useGlobalRefresh } from "../hooks/useGlobalRefresh";

export default function Index() {
  const router = useRouter();

  const { isReady, showCustomSplash } = useAppInitialization();
  const { refreshData, refreshing } = useGlobalRefresh();

  useEffect(() => {
    const fetchData = async () => {
      await refreshData(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        router.replace("(tabs)");
      }, 500);
    }
  }, [isReady]);

  if (showCustomSplash) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeScreen>
      <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require("../assets/images/visual-picture.png")} 
          style={{ width: '100%', height: '80%', resizeMode: 'contain' }}
        />

        {!isReady && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 20,
              zIndex: 10,
            }}
          >
            <LottieView
              source={require("../assets/paw.json")}
              autoPlay
              loop
              style={{
                height: 120,
                width: 120,
                transform: [{ rotate: "45deg" }],
              }}
            />
          </View>
        )}
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
        <Text className="text-black text-2xl font-quicksand-bold text-center">
          Welcome to CodeRespite!
        </Text>
        <Text className="text-gray-800 text-base font-quicksand text-center mt-2">
          Learn to code with your favorite Meowgrammer! <Emoji>🐾</Emoji>
        </Text>

        {!isReady && (
          <View className="items-center mt-4">
            <LottieView
              source={require("../assets/cat.json")}
              autoPlay
              loop
              style={{
                height: 80,
                width: 80,
                marginBottom: -10,
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
