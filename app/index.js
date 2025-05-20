import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import SafeScreen from "../components/SafeScreen";
import LottieView from "lottie-react-native";

export default function Index() {
  const router = useRouter();
  return (
    <SafeScreen>
      <View className="h-2/3">
        <Image source={require("../assets/images/visual-picture.png")} />
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
          <Text className="text-white text-lg font-semibold">Let's Start!</Text>
        </Pressable>
      </View>
      <LottieView
              source={require("../assets/fun.json")}
              autoPlay
              loop={false} // Run only once
              onAnimationFinish={() => {
                // setWinner(false);
              }} // Hide after finishing
              style={{
                width: "100%",
                height: "100%",
                transform: [{ translateY: -100 }],
              }} // Covers the whole screen
            />
    </SafeScreen>
  );
}
