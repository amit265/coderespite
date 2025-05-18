import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import modules from "../../data/javascript/lessons.json"; // now an array

export default function Learn() {
  const router = useRouter();

  const renderModuleItem = ({ item }) => {

    return (
      <TouchableOpacity
        onPress={() => router.push(`/learn/${item.moduleId}`)}
        className="bg-white p-4 rounded-xl shadow-md mb-4"
      >
        <Text className="text-xl font-bold text-red-500 mb-1">
          📘 {item.title}
        </Text>
        <Text className="text-gray-700 text-sm">{item.description}</Text>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-xs text-gray-500">Level: {item.level}</Text>
          <Text className="text-xs text-gray-500">
            {item.lessons?.length || 0} Lessons
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f9fafb] px-4 pt-6">
      <Text className="text-2xl font-bold mb-4 text-gray-800">
        📂 JavaScript Modules
      </Text>

      <FlatList
        data={modules}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.moduleId}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
