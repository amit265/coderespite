import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const actions = [
  { icon: "📘", label: "Learn", bg: "bg-blue-100", tab: "learn" },
  { icon: "📇", label: "Flashcards", bg: "bg-yellow-100", tab: "flashcards" },
  { icon: "📝", label: "Quiz", bg: "bg-green-100", tab: "quiz" },
  { icon: "👤", label: "Profile", bg: "bg-purple-100", tab: "profile" },
];

export default function QuickActionGrid() {
  const router = useRouter();
  return (
    <View className="bg-white p-4 rounded-xl shadow-md mx-4 my-2">
      <Text className="text-lg font-semibold mb-4">🔀 Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action, index) => (
          <Pressable
            key={index}
            className={`w-[48%] h-28 mb-4 ${action.bg} rounded-xl p-4 shadow-sm`}
            onPress={() => {
              router.push(`(tabs)/${action.tab}`);
            }}
          >
            <Text className="text-3xl mb-2">{action.icon}</Text>
            <Text className="text-base font-medium text-gray-800">
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
