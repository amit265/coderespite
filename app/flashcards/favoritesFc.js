import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Favorites from "../../components/Favorites";
import SafeScreen from "../../components/SafeScreen";
import colors from "../../constants/colors";
export default function Index() {
  const router = useRouter();
  return (
    <SafeScreen>
      <View
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          gap: 20,
          paddingLeft: 20,
          paddingBottom: 10
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
        <Text
          style={{
            fontFamily: "nunito-bold",
            fontSize: 24,
            color: colors.BLACK,
            textAlign: "center",
          }}
        >
          Flash Cards

        </Text>
      </View>
      <Favorites />
    </SafeScreen>
  );
}
