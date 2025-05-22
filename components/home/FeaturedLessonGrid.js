import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function FeaturedLessonGrid() {
  const router = useRouter();
  return (
    <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md mx-4 my-2">
      <Text className="text-xl font-nunito-bold text-gray-800 mb-2">
        📚 Featured Lesson
      </Text>

      <Text className="text-base text-gray-600 font-nunito">
        🎯 Mastering JavaScript Loops
      </Text>
    </TouchableOpacity>
  );
}
