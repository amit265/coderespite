import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import modules from "../../data/javascript/lessons.json"; // array of modules
import { Ionicons } from "@expo/vector-icons";

export default function Learn() {
  const router = useRouter();
  const [courseSelected, setCourseSelected] = useState("All");

  const filteredCourses =
    courseSelected === "All"
      ? modules
      : modules.filter((course) => course.level === courseSelected);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/learn/${item.moduleId}`)}
      className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-row gap-4"
    >
      <View>
      <Ionicons name="logo-javascript" size={48} color="black" />
      </View>
      <View>
        <Text className="text-xl font-bold text-black mb-1">{item.title}</Text>
        {/* <Text className="text-gray-700 text-sm">{item.description}</Text> */}
        <View className="flex-col justify-between">
          <Text className="text-sm text-gray-500">Level: {item.level}</Text>
          <Text className="text-xs text-gray-500">
            {item.lessons?.length || 0} Lessons
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <View className="flex-1 bg-[#f9fafb] px-4 pt-6">
      <Text className="text-2xl font-bold mb-6 text-gray-800 text-center">
        JavaScript Modules
      </Text>

      <View className="flex-row justify-center gap-2 mb-6 flex-wrap">
        {levels.map((level) => (
          <Pressable
            key={level}
            onPress={() => setCourseSelected(level)}
            className={`px-4 py-2 rounded-full ${
              courseSelected === level
                ? "border-b border-[#11426B]"
                : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                courseSelected === level ? "text-black" : "text-gray-400"
              }`}
            >
              {level}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.moduleId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
