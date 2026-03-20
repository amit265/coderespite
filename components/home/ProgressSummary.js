import React from "react";
import { Text, View } from "react-native";
import { Emoji, EmojiText } from "../../constants/constants";

export default function ProgressSummary() {
  return (
    <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <EmojiText className="text-lg font-nunito-semibold text-gray-800 mb-4">📊 Your Progress</EmojiText>
      <View className="space-y-2">
        <EmojiText className="text-base text-gray-700">📘 Course: 60%</EmojiText>
        <EmojiText className="text-base text-gray-700">📇 Flashcards: 40%</EmojiText>
        <EmojiText className="text-base text-gray-700">📝 Quizzes: 30%</EmojiText>
      </View>
    </View>
  );
}
