import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import colors from "../../constants/colors";

export default function Header() {
  const router = useRouter();

  return (
    <View className="flex-row justify-between items-start border-b border-gray-300 px-4 mb-4 pb-8">
      <View>
        <View className="flex-row">
          <Text
            className="text-2xl"
            style={{ fontFamily: "Quicksand-bold", color: colors.ERROR }}
          >
            CODE
          </Text>
          <Text
            className="text-2xl"
            style={{ fontFamily: "Quicksand-bold", color: colors.TEXT }}
          >
            RESPITE
          </Text>
        </View>
        <Text className="text-xs mt-1" style={{ color: colors.TEXT, fontFamily: "Quicksand-bold" }}>
          REFRESH YOUR TECH SKILLS
        </Text>
      </View>

      <View className="flex-row gap-2 p-2">
        {/* Uncomment if needed */}
        {/* <TouchableOpacity onPress={() => router.push("/favorites")}>
          <Ionicons name="heart" size={28} color="black" />
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
