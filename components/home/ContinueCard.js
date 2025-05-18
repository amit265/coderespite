import React from "react";
import { Text, View } from "react-native";

export default function ContinueCard() {
  return (
    <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        🐾 Pawgress Tracker
      </Text>

      <View className="space-y-2 mb-4">
        <Text className="text-base text-gray-700">
          🧶 Level: <Text className="font-medium">Loop Kitten</Text>
        </Text>
        <Text className="text-base text-gray-700">
          📊 Progress: <Text className="font-medium">45%</Text>
        </Text>
        <Text className="text-base text-gray-700">
          🔓 Next Title: <Text className="font-medium">Callback Cat</Text>
        </Text>
      </View>

      <View className="bg-yellow-100 p-4 rounded-xl">
        <Text className="text-sm text-gray-800">
          ✨ You're starting to chase those loops like a pro. Just don’t get
          tangled! 🧶
        </Text>
        <Text className="text-sm mt-2 text-gray-700 font-medium">
          👉 55% more to become a Callback Cat 🐱
        </Text>
      </View>
    </View>
  );
}
