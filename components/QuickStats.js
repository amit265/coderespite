import { Entypo } from "@expo/vector-icons";
import React, { useContext, useMemo, useState } from "react";
import { Text, TouchableOpacity, View, Share, Alert, Platform } from "react-native";
import colors from "../constants/colors";
import { EmojiText, DESTYA_SHARE_LINK } from "../constants/constants";
import { allCoursesContext } from "../context/context";
import Button from "./shared/Button";

export default function QuickStats({ userData }) {
  const progress = useMemo(() => userData?.progress || {}, [userData]);
  const { allCourses } = useContext(allCoursesContext);
  const validCourseTitles = useMemo(
    () =>
      new Set(
        (allCourses || [])
          .map((course) => course?.title)
          .filter((title) => typeof title === "string" && title.trim())
      ),
    [allCourses]
  );
  const progressEntries = useMemo(
    () =>
      Object.entries(progress).filter(
        ([courseName, courseData]) =>
          validCourseTitles.has(courseName) &&
          courseData &&
          typeof courseData === "object"
      ),
    [progress, validCourseTitles]
  );
  const hasProgress = progressEntries.length > 0;
  const [hideSections, setHideSections] = useState({
    flashcardsLoved: false,
    flashcardsViewed: false,
    attemptedQuizzes: false,
    coursesEnrolled: false,
  });

  const handleShareProgress = async () => {
    const totalEnrolled = progressEntries.length || 0;
    const totalLoved = progressEntries.reduce(
      (total, course) => total + getStatCount(course[1], "flashcardsLoved"),
      0
    ) || 0;
    const totalViewed = progressEntries.reduce(
      (total, course) => total + getStatCount(course[1], "flashcardsViewed"),
      0
    ) || 0;
    const totalQuizzes = progressEntries.reduce(
      (total, course) => total + getStatCount(course[1], "attemptedQuizzes"),
      0
    ) || 0;

    const message = `📊 My CodeRespite Progress Update! 🐾\n\n` +
      `📚 Enrolled Courses: ${totalEnrolled}\n` +
      `🧠 Viewed Flashcards: ${totalViewed}\n` +
      `💙 Favorite Flashcards: ${totalLoved}\n` +
      `🧪 Quizzes Completed: ${totalQuizzes}\n\n` +
      `Refresh your tech skills with me! Download the app: ${DESTYA_SHARE_LINK}`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          Alert.alert("Progress Copied! 📋", "Your learning progress has been copied to the clipboard!");
        } else {
          Alert.alert("My Learning Progress", message);
        }
        return;
      }

      await Share.share({
        message,
      });
    } catch (error) {
      console.log("Share progress error:", error.message);
    }
  };

  const toggleHide = (key) => {
    setHideSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatCount = (courseData, key) => {
    const statValue = courseData?.[key];
    return Array.isArray(statValue) ? statValue.length : 0;
  };

  const renderStatBlock = (emoji, title, key, unit = "items") => {
    return (
      <View className="mb-4">
        {hasProgress ? (
          <View className="flex flex-col flex-wrap gap-2 items-center justify-center mt-4">
            {progressEntries.map(([courseName, courseData]) => (
              <View
                key={courseName}
                className="rounded-2xl py-4 px-4 items-center flex flex-row w-full gap-4"
                style={{ backgroundColor: colors.WHITE }}
              >
                <Text className="text-sm font-nunito text-gray-800" numberOfLines={1}>
                  {courseName}:
                </Text>
                <Text className="text-sm text-gray-600">
                  {getStatCount(courseData, key)}
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
        <EmojiText style={{ fontSize: 20 }}>📊 Learning Overview</EmojiText>
      </View>

      <TouchableOpacity
        className="py-4 px-4 rounded-lg"
        style={{ backgroundColor: colors.BACKGROUND }}
        onPress={() => toggleHide("coursesEnrolled")}
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <EmojiText style={{ fontSize: 18 }}>📚 Courses Enrolled: {progressEntries.length || 0}</EmojiText>
          </View>
          <Entypo name="arrow-with-circle-down" size={24} color="black" />
        </View>
        {hideSections.coursesEnrolled && (
          <View>
            {hasProgress ? (
              <View className="flex flex-col flex-wrap gap-2 items-center justify-center mt-4">
                {progressEntries.map(([courseName]) => (
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
            <EmojiText style={{ fontSize: 18 }}>💙 Favorite Flashcards: {progressEntries.reduce(
                (total, course) =>
                  total + getStatCount(course[1], "flashcardsLoved"),
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
            <EmojiText style={{ fontSize: 18 }}>🧠 Viewed Flashcards: {progressEntries.reduce(
                (total, course) =>
                  total + getStatCount(course[1], "flashcardsViewed"),
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
            <EmojiText style={{ fontSize: 18 }}>🧪 Quizzes Completed: {progressEntries.reduce(
                (total, course) =>
                  total + getStatCount(course[1], "attemptedQuizzes"),
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

      <Button
        text="Share My Progress 🚀"
        onPress={handleShareProgress}
      />
    </View>
  );
}
