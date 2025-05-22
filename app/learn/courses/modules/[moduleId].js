import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../../../constants/colors";
import { courseIcons } from "../../../../constants/constants";
import { allCoursesContext } from "../../../../context/context";

export default function ModuleId() {
  const { selectedCourse, selectedModule } = useContext(allCoursesContext);
  const [expandedLessons, setExpandedLessons] = useState({});
  const router = useRouter();

  if (!selectedModule) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg font-nunito-semibold">Module not found.</Text>
      </View>
    );
  }

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  return (
    <>
      <View
        className="flex flex-row gap-2 py-4 px-2"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={35} color="black" />
        </Pressable>
        <Text className="text-2xl font-quicksand-bold mb-2 text-gray-900">
          {selectedCourse.title} Module
        </Text>
      </View>
      <ScrollView
        className="flex-1 px-6 py-4"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <View className="flex flex-row gap-4 p-4">
          <View style={{ width: 120, height: 120 }}>
            <Image
              source={courseIcons[selectedCourse?.icon]}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 20,
              }}
            />
          </View>
          <View className="flex-1 gap-2 justify-center">
            <Text className="text-gray-700 text-lg font-nunito-bold">
              {selectedModule?.title}
            </Text>
            <Text className="text-sm font-nunito-semibold text-gray-700">
              Level: {selectedModule?.level}
            </Text>
            <Text className="text-sm font-nunito-semibold mb-6 text-gray-700">
              📘 {selectedModule?.lessons?.length} Lessons
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-base font-nunito-semibold text-gray-700">
            {selectedModule?.description}
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          {selectedModule.lessons.map((lesson, index) => {
            const isExpanded = expandedLessons[lesson.lessonId];
            return (
              <TouchableOpacity
                key={lesson.lessonId}
                className="mb-4"
                onPress={() => toggleLesson(lesson.lessonId)}
                activeOpacity={0.9}
              >
                <View className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <View className="flex flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-nunito-semibold text-gray-800">
                      {index + 1}. {lesson.title}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={24}
                      color="black"
                    />
                  </View>

                  {isExpanded && (
                    <>
                      {lesson.type === "theory" && (
                        <Text className="text-gray-700 font-nunito">{lesson.content}</Text>
                      )}
                      {lesson.type === "code" && (
                        <View className="bg-gray-900 rounded p-3 mt-2">
                          <Text className="text-green-400 font-nunito">
                            {lesson.content}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
