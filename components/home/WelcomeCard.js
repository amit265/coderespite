import React from "react";
import { Text, View } from "react-native";

export default function Welcome() {
  return (
    <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <View className="items-center space-y-2">
        <Text className="text-lg font-semibold text-gray-800">Hi, Aman 👋</Text>
        <Text className="text-base text-gray-600">Ready for a quick code break?</Text>
      </View>
    </View>
  );
}
