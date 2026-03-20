import { Entypo } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import { Emoji, EmojiText } from "../constants/constants";

export default function QuickStats({ userData }) {
  const progress = userData?.progress || {};
  const hasProgress = Object.keys(progress).length > 0;
  const [hideSections, setHideSections] = useState({
    flashcardsLoved: false,
    flashcardsViewed: false,
    attemptedQuizzes: false,
    coursesEnrolled: false,
  });
  const toggleHide = (key) => {
    setHideSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const renderStatBlock = (emoji, title, key, unit = "items") => {
    return (
      <View className="mb-4">
        {hasProgress ? (
          <View className="flex flex-col flex-wrap gap-2 items-center justify-center mt-4">
            {Object.entries(progress).map(([courseName, courseData]) => (
              <View
                key={courseName}
                className="rounded-2xl py-4 px-4 items-center flex flex-row w-full gap-4"
                style={{ backgroundColor: colors.WHITE }}
              >
                <Text className="text-sm font-nunito text-gray-800" numberOfLines={1}>
                  {courseName}:
                </Text>
                <Text className="text-sm text-gray-600">
                  {courseData?.[key]?.length || 0}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-sm text-gray-500">0</Text>
        )}
      </View>
    );
  };

  return (
    <View className="flex flex-col gap-4 mt-4 p-4 bg-white rounded-xl">
      <View
        className="border-b border-gray-800 mb-3 flex-row items-center gap-2"
        style={{ borderStyle: "dotted", paddingBottom: 20 }}
      >
        <EmojiText style={{ fontSize: 20 }}>📊 Quick Stats:</EmojiText>
      </View>

      <TouchableOpacity
        className="py-4 px-4 rounded-lg"
        style={{ backgroundColor: colors.BACKGROUND }}
        onPress={() => toggleHide("coursesEnrolled")}
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <EmojiText style={{ fontSize: 18 }}>📚 Courses Enrolled: {Object.keys(progress).length || 0}</EmojiText>
          </View>
          <Entypo name="arrow-with-circle-down" size={24} color="black" />
        </View>
        {hideSections.coursesEnrolled && (
          <View>
            {hasProgress ? (
              <View className="flex flex-col flex-wrap gap-2 items-center justify-center mt-4">
                {Object.entries(progress).map(([courseName, courseData]) => (
                  <View
                    key={courseName}
                    className="rounded-2xl py-4 px-4 items-center flex flex-row w-full gap-4"
                    style={{ backgroundColor: colors.WHITE }}
                  >
                    <Text className="text-sm font-nunito text-gray-800">
                      {courseName}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-500"> </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        className="py-4 px-4 rounded-lg"
        style={{ backgroundColor: colors.BACKGROUND }}
        onPress={() => toggleHide("flashcardsLoved")}
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <EmojiText style={{ fontSize: 18 }}>💙 Favorite Flashcards: {Object.keys(progress).reduce(
                (total, course) =>
                  total + (progress[course]?.flashcardsLoved?.length || 0),
                0
              ) || 0}</EmojiText>
          </View>
          <Entypo name="arrow-with-circle-down" size={24} color="black" />
        </View>

        {hideSections.flashcardsLoved &&
          renderStatBlock(
            "💙",
            "Favorite Flashcards:",
            "flashcardsLoved",
            "cards"
          )}
      </TouchableOpacity>
      <TouchableOpacity
        className="py-4 px-4 rounded-lg"
        style={{ backgroundColor: colors.BACKGROUND }}
        onPress={() => toggleHide("flashcardsViewed")}
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <EmojiText style={{ fontSize: 18 }}>🧠 Viewed Flashcards: {Object.keys(progress).reduce(
                (total, course) =>
                  total + (progress[course]?.flashcardsViewed?.length || 0),
                0
              ) || 0}</EmojiText>
          </View>
          <Entypo name="arrow-with-circle-down" size={24} color="black" />
        </View>

        {hideSections.flashcardsViewed &&
          renderStatBlock("🧠", "Viewed Flashcards:", "flashcardsViewed", "cards")}
      </TouchableOpacity>
      <TouchableOpacity
        className="py-4 px-4 rounded-lg"
        style={{ backgroundColor: colors.BACKGROUND }}
        onPress={() => toggleHide("attemptedQuizzes")}
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <EmojiText style={{ fontSize: 18 }}>🧪 Quizzes Completed: {Object.keys(progress).reduce(
                (total, course) =>
                  total + (progress[course]?.attemptedQuizzes?.length || 0),
                0
              ) || 0}</EmojiText>
          </View>
          <Entypo name="arrow-with-circle-down" size={24} color="black" />
        </View>

        {hideSections.attemptedQuizzes &&
          renderStatBlock(
            "🧪",
            "Quizzes Completed:",
            "attemptedQuizzes",
            "quizzes"
          )}
      </TouchableOpacity>
    </View>
  );
}
