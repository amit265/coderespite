import React from "react";
import { Text, View } from "react-native";

export default function QuickStats({ userDetails }) {
  console.log("userdetails", userDetails);
  return (
    <View className="flex flex-col gap-4 mt-4 p-4 bg-white rounded-xl">
      <View
        className="border-b border-gray-800 mb-3"
        style={{ borderStyle: "dotted", paddingBottom: 20 }}
      >
        <Text className="text-base font-bold">📊 Quick Stats:</Text>
      </View>

      <View className="flex flex-row items-start">
        <Text className="text-base font-bold">🧠 Flashcards Mastered:</Text>
        <Text className="text-base">87</Text>
      </View>
      <View className="flex flex-row items-start flex-wrap">
        <Text className="text-base font-bold">🧪 Quizzes Completed:</Text>
        <Text className="text-base flex-wrap">12</Text>
      </View>
      <View className="flex flex-row items-start">
        <Text className="text-base font-bold">📚 Courses Enrolled:</Text>
        <Text className="text-base">3</Text>
      </View>
    </View>
  );
}
