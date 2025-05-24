import React from "react";
import { Text, View } from "react-native";
import { levels } from "../../constants/constants";
import ProgressBar from "./ProgressBar";

export default function ContinueCard({ userData }) {
  const currentLevelIndex = (userData?.level?.currentLevel || 1) - 1;

  // fallback values to avoid out-of-range or undefined levels
  const level = levels[currentLevelIndex] ?? levels[0];
  const nextLevel = levels[currentLevelIndex + 1] ?? {
    title: "Supreme Meowster",
    description: "You've reached the top level. Keep maintaining your purrfection!",
  };

  const currentXp = userData?.level?.xp ?? 0;
  const nextLevelXp = userData?.level?.nextLevelXP ?? 100;

  const progressRaw =
    nextLevelXp > 0 ? Math.floor((currentXp / nextLevelXp) * 100) : 0;
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  return (
    <View className="bg-white mx-4 mb-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <Text className="text-lg font-nunito-semibold text-gray-800 mb-4">
        🐾 Pawgress Tracker
      </Text>

      <View className="space-y-2 mb-4">
        <Text className="text-base font-nunito text-gray-700">
          🧶 Level: <Text className="font-medium">{level.title}</Text>
        </Text>
        <Text className="text-base font-nunito text-gray-700">
          📊 Progress: <Text className="font-medium">{progress}%</Text>
        </Text>
        <Text className="text-base font-nunito text-gray-700">
          🔓 Next Title: <Text className="font-medium">{nextLevel.title}</Text>
        </Text>
      </View>

      <View className="mb-4">
        <ProgressBar progress={progress} />
      </View>

      <View className="bg-yellow-100 p-4 rounded-xl font-nunito">
        <Text className="text-sm text-gray-800">{level.description}</Text>
        <Text className="text-sm mt-2 text-gray-700 font-nunito">
          👉 {100 - progress}% more to become a {nextLevel.title}🐱
        </Text>
      </View>
    </View>
  );
}
