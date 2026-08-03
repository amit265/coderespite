import React, { useContext, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import { allCoursesContext, userDetailsContext } from "../../context/context";
import colors from "../../constants/colors";
import { EmojiText } from "../../constants/constants";

export default function JumpBackInCard() {
  const router = useRouter();
  const { userData } = useContext(userDetailsContext);
  const { allCourses, setSelectedCourse } = useContext(allCoursesContext);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const mostRecentCourseData = useMemo(() => {
    if (!userData?.progress || !allCourses || allCourses.length === 0) return null;

    let mostRecentCourse = null;
    let mostRecentDate = 0;
    let highestProgressObj = null;

    Object.entries(userData.progress).forEach(([courseTitle, progressObj]) => {
      let maxDateStr = "";

      const checkDates = (arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            if (item?.date && item.date > maxDateStr) {
              maxDateStr = item.date;
            }
          });
        }
      };

      checkDates(progressObj.attemptedQuizzes);
      checkDates(progressObj.flashcardsViewed);

      if (maxDateStr) {
        const dateNum = new Date(maxDateStr).getTime();
        if (dateNum > mostRecentDate) {
          mostRecentDate = dateNum;
          mostRecentCourse = courseTitle;
          highestProgressObj = progressObj;
        }
      }
    });

    if (!mostRecentCourse) return null;

    // Find the course in allCourses
    const courseDef = allCourses.find((c) => c.title === mostRecentCourse);
    if (!courseDef) return null;

    // Calculate percentage
    let percentage = 0;
    const isAI = courseDef.id?.toString().startsWith("AI_");

    if (isAI) {
      const totalCards = courseDef.flashcards?.length || 1;
      const viewedCards = highestProgressObj.flashcardsViewed?.length || 0;
      percentage = (viewedCards / totalCards) * 100;
    } else {
      const totalModules = courseDef.modules?.length || 1;
      const passedQuizzes = (highestProgressObj.attemptedQuizzes || []).filter(
        (q) => q.score >= 60
      ).length;
      percentage = (passedQuizzes / totalModules) * 100;
    }

    percentage = Math.min(Math.max(percentage, 0), 100);

    return { course: courseDef, percentage: Math.floor(percentage) };
  }, [userData?.progress, allCourses]);

  if (!mostRecentCourseData) return null;

  const { course, percentage } = mostRecentCourseData;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handleResume = () => {
    setSelectedCourse(course);
    if (course.id?.toString().startsWith("AI_")) {
      router.push(`/learn/aiRoadmap?coursesId=${course.id}`);
    } else {
      router.push(`/learn/courses/${course.id}`);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleResume}
        className="bg-white mx-4 mb-4 rounded-2xl p-6 shadow-md border border-gray-200"
      >
        <View className="flex-row items-center mb-3">
          <Ionicons name="play-circle" size={24} color={colors.PRIMARY} />
          <EmojiText className="text-lg ml-2" style={{ fontFamily: "nunito-bold", color: colors.PRIMARY }}>
            Jump Back In
          </EmojiText>
        </View>

        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800" numberOfLines={1}>
              {course.title}
            </Text>
            <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
              {percentage === 100 ? "Completed! Review anytime." : "Pick up right where you left off"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xs font-nunito text-gray-600 font-bold">Progress</Text>
          <Text className="text-xs font-nunito text-gray-800 font-bold">{percentage}%</Text>
        </View>

        <ProgressBar
          progress={percentage / 100}
          color={colors.PRIMARY}
          style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)" }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
