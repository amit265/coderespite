import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView
      className="items-center"
      style={{ backgroundColor: colors.BACKGROUND }}
    >
      <View className="h-2/3">
        <Image source={require("../assets/images/visual-picture.png")} />
      </View>
      <View className="h-1/3 p-8">
        <Text className="text-black text-3xl font-bold text-center mt-2">
          Welcome to CodeRespite!
        </Text>
        <Text className="text-gray-800 text-base text-center mt-2 mx-8">
          Learn to code with your favorite Meowgrammer! 🚀
        </Text>
        <Pressable
          onPress={() => router.replace("(tabs)")}
          className="bg-red-600 px-6 py-3 rounded-lg mt-8 mx-auto"
        >
          <Text className="text-white text-lg font-semibold">Let's Start!</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
