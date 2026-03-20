import React from "react";
import { Text, View } from "react-native";
import { levels, Emoji, EmojiText } from "../../constants/constants";
import LevelUpModal from "../LevelUpModal";
import ProgressBar from "./ProgressBar";

export default function ContinueCard({ userData }) {
  const currentLevelIndex = (userData?.level?.currentLevel || 1) - 1;
  const userLevel = userData?.level?.currentLevel;
  // fallback values to avoid out-of-range or undefined levels
  const level = levels[currentLevelIndex] ?? levels[0];
  const nextLevel = levels[currentLevelIndex + 1] ?? {
    title: "Supreme Meowster",
    description:
      "You've reached the top level. Keep maintaining your purrfection!",
  };

  const currentXp = userData?.level?.xp ?? 0;
  const nextLevelXp = userData?.level?.nextLevelXP ?? 100;

  const progressRaw =
    nextLevelXp > 0 ? Math.floor((currentXp / nextLevelXp) * 100) : 0;
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  return (
    <View className="bg-white mx-4 mb-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <EmojiText className="text-xl text-black mb-4" style={{ fontFamily: "nunito-bold" }}>
        🐾 Pawgress Tracker
      </EmojiText>

      <View className="space-y-2 mb-4">
        <EmojiText className="text-base font-nunito text-gray-600">
          🧶 Level: <Text className="font-medium">{level.title}</Text>
        </EmojiText>
        <EmojiText className="text-base font-nunito text-gray-600">
          📊 Progress: <Text className="font-medium">{progress}%</Text>
        </EmojiText>
        <EmojiText className="text-base font-nunito text-gray-600">
          🔓 Next Title: <Text className="font-medium">{nextLevel.title}</Text>
        </EmojiText>
      </View>

      <View className="mb-4">
        <ProgressBar progress={progress} />
      </View>

      <View className="bg-yellow-100 p-4 rounded-xl font-nunito">
        <EmojiText className="text-sm text-gray-700 font-nunito text-justify">{level.description}</EmojiText>
        <EmojiText className="text-sm mt-2 text-gray-700 font-nunito text-justify">
          👉 {100 - progress}% more to become a {nextLevel.title} 🐱
        </EmojiText>
      </View>
    </View>
  );
}
