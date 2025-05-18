import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import colors from "../../constants/colors";
import modules from "../../data/javascript/lessons.json";

export default function ModuleId() {
  const { moduleId } = useLocalSearchParams();
  const moduleData = modules.find((mod) => mod.moduleId === moduleId);
  const router = useRouter();
  if (!moduleData) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg">Module not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-6 py-4"
      style={{ backgroundColor: colors.BACKGROUND }}
    >
      <View className="flex flex-row gap-2">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={35} color="black" />
        </Pressable>
        <Text className="text-3xl font-bold mb-2 text-gray-900">
          {moduleData.title}
        </Text>
      </View>
      <Text className="text-gray-700 mb-4">{moduleData.description}</Text>
      <Text className="text-sm font-semibold mb-6 text-blue-600">
        Level: {moduleData.level}
      </Text>

      {moduleData.lessons.map((lesson) => (
        <View
          key={lesson.lessonId}
          className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50"
        >
          {lesson.title && (
            <Text className="text-lg font-semibold mb-1 text-gray-800">
              {lesson.title}
            </Text>
          )}
          {lesson.type === "theory" && (
            <Text className="text-gray-700">{lesson.content}</Text>
          )}
          {lesson.type === "code" && (
            <View className="bg-gray-900 rounded p-3">
              <Text className="text-green-400 font-mono">{lesson.content}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
