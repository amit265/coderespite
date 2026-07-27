import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import SplashScreenComponent from "../components/SplashScreenComponent";
import { EmojiText } from "../constants/constants";
import { useAppInitialization } from "../hooks/useAppInitialization";

export default function Index() {
  const router = useRouter();

  const { isReady, showCustomSplash } = useAppInitialization();

  useEffect(() => {
    if (isReady) {
      const delay = Platform.OS === 'web' ? 2500 : 500;
      const timer = setTimeout(() => {
        router.replace("(tabs)");
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (showCustomSplash || isReady) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeScreen>
      <View
        style={{
          flex: Platform.OS === "ios" ? 1.55 : 1.75,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: Platform.OS === "ios" ? 8 : 0,
        }}
      >
        <Image 
          source={require("../assets/images/visual-picture.png")} 
          style={{ width: "100%", height: "78%", resizeMode: "contain" }}
        />
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: "flex-start",
          paddingTop: Platform.OS === "ios" ? 4 : 0,
        }}
      >
        <Text className="text-black text-2xl font-quicksand-bold text-center">
          Welcome to CodeRespite!
        </Text>
        <EmojiText className="text-gray-800 text-base font-quicksand text-center mt-2">
          Learn to code with your favorite Meowgrammer! 🐾
        </EmojiText>

        {!isReady && (
          <View className="items-center mt-3">
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
      <Text
        style={{
          position: "absolute",
          bottom: 25,
          alignSelf: "center",
          fontFamily: "monospace",
          fontSize: 10,
          color: "rgba(0, 0, 0, 0.4)",
          letterSpacing: 1.5,
        }}
      >
        ● built by destyastudio.
      </Text>
    </SafeScreen>
  );
}
