import React from "react";
import { Text, View } from "react-native";
import { levels } from "../../constants/constants";

export default function ContinueCard({ userData }) {
  const level = levels[userData?.level?.currentLevel - 1] || "Curious Kitten";
  const nextLevel = levels[userData?.level?.currentLevel] || "Curious Kitten";

  return (
    <View className="bg-white mx-4 mb-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <Text className="text-lg font-nunito-semibold text-gray-800 mb-4">
        🐾 Pawgress Tracker
      </Text>

      <View className="space-y-2 mb-4">
        <Text className="text-base font-nunito  text-gray-700">
          🧶 Level:{" "}
          <Text className="font-medium">
            {level?.title || "Curious kitten"}{" "}
          </Text>
        </Text>
        <Text className="text-base font-nunito text-gray-700">
          📊 Progress: <Text className="font-medium">45%</Text>
        </Text>
        <Text className="text-base font-nunito text-gray-700">
          🔓 Next Title:{" "}
          <Text className="font-medium">
            {nextLevel?.title || "Playful Pouncer"}
          </Text>
        </Text>
      </View>

      <View className="bg-yellow-100 p-4 rounded-xl font-nunito">
        <Text className="text-sm text-gray-800">
          {level?.description ||
            "You've just wandered into the world of code. Everything is new, shiny, and full of wonder."}
        </Text>
        <Text className="text-sm mt-2 text-gray-700 font-nunito">
          👉 55% more to become a {nextLevel?.title || "Playful Pouncer"}🐱
        </Text>
      </View>
    </View>
  );
}
