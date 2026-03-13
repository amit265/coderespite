import React from "react";
import { Text, View } from "react-native";
import { Emoji } from "../../constants/constants";

export default function ProgressSummary() {
  return (
    <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <Text className="text-lg font-nunito-semibold text-gray-800 mb-4"><Emoji>📊</Emoji> Your Progress</Text>
      <View className="space-y-2">
        <Text className="text-base text-gray-700"><Emoji>📘</Emoji> Course: 60%</Text>
        <Text className="text-base text-gray-700"><Emoji>📇</Emoji> Flashcards: 40%</Text>
        <Text className="text-base text-gray-700"><Emoji>📝</Emoji> Quizzes: 30%</Text>
      </View>
    </View>
  );
}
