import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeScreen from "../../../../components/SafeScreen";
import Button from "../../../../components/shared/Button";
import colors from "../../../../constants/colors";
import { courseIcons, getQuizFeedback } from "../../../../constants/constants";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";

export default function ModuleId() {
  const { selectedCourse, selectedModule, setSelectedQuiz } =
    useContext(allCoursesContext);
  const { userData } = useContext(userDetailsContext);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [moduleQuizStatus, setModuleQuizStatus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const router = useRouter();
  const selectedQuizId = `quiz_${selectedModule?.id}`;
  const { setClickCount } = useContext(adConfigContext);
  useEffect(() => {
    const selectedQuizType = Array.isArray(selectedCourse?.quizzes)
      ? selectedCourse.quizzes.find((a) => a.id === selectedQuizId)
      : null;

    setSelectedQuiz(selectedQuizType);

    const progress = userData?.progress;
    const allAttemptedQuizzes = Object.values(progress || {}).flatMap(
      (course) => course.attemptedQuizzes || []
    );

    const filterCourse = allAttemptedQuizzes.filter(
      (a) => a.courseId === selectedCourse?.id
    );

    const filterModule = filterCourse.find(
      (a) => a.moduleId === selectedModule?.id
    );

    setModuleQuizStatus(filterModule);
  }, [
    selectedCourse,
    selectedModule,
    userData,
    selectedQuizId,
    setSelectedQuiz,
  ]);

  useEffect(() => {
    const feedback = getQuizFeedback(moduleQuizStatus?.score);
    setFeedback(feedback);
  }, [moduleQuizStatus]);

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  if (!selectedModule) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg font-nunito-semibold">
          Module not found.
        </Text>
      </View>
    );
  }

  return (
    <SafeScreen>
      <View
        className="flex flex-row gap-2 py-2 px-2"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
        <Text
          className="text-2xl font-nunito-bold mb-2 text-black"
          numberOfLines={1}
        >
          {selectedCourse?.title} Module
        </Text>
      </View>

      <ScrollView
        className="flex"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <View className="flex flex-row gap-4 p-4">
          <View style={{ width: 150, height: 150 }}>
            <Image
              source={
                courseIcons[selectedCourse?.icon] ||
                require("../../../../assets/default-icon.png")
              }
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 20,
              }}
            />
          </View>
          <View className="flex-1 gap-2 justify-center">
            <Text
              className="text-black text-lg font-nunito-bold"
              numberOfLines={3}
            >
              {selectedModule?.title}
            </Text>
            <Text className="text-sm font-nunito text-gray-700">
              Level: {selectedModule?.level}
            </Text>
            <View className="flex flex-row items-center gap-1 mt-1">
              <AntDesign name="book" size={16} color="gray" />
              <Text className="text-sm font-nunito text-gray-700">
                {selectedModule?.lessons?.length} Lessons
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-sm font-nunito text-gray-700 text-justify">
            {selectedModule?.description}
          </Text>
        </View>

        <View style={{ marginBottom: 60 }}>
          {selectedModule?.lessons?.map((lesson, index) => {
            const isExpanded = expandedLessons[lesson.lessonId];
            return (
              <TouchableOpacity
                key={lesson.lessonId}
                className="mb-4"
                onPress={() => toggleLesson(lesson.lessonId)}
                activeOpacity={0.9}
              >
                <View className="py-4 border border-gray-300 rounded-lg bg-gray-50">
                  <View className="flex flex-row justify-between items-center">
                    <Text
                      className="text-base font-nunito text-black px-6 py-2"
                      style={{ paddingRight: 40 }}
                    >
                      {index + 1}. {lesson.title}
                    </Text>
                    <View className="absolute right-4 justify-center items-center">
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="black"
                      />
                    </View>
                  </View>

                  {isExpanded && (
                    <>
                      {lesson.type === "theory" && (
                        <Text className="text-gray-600 font-nunito px-6 text-justify text-sm">
                          {lesson.content}
                        </Text>
                      )}
                      {lesson.type === "code" && (
                        <View className="bg-gray-900 rounded mt-2">
                          <Text className="text-green-400 font-nunito px-6 py-3 text-sm">
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

        {feedback && (
          <View
            className="px-6 py-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200"
            style={{ marginBottom: 150 }}
          >
            <Text className="text-xl font-nunito-bold text-black mb-3">
              {feedback.title}
            </Text>

            <Text className="text-base text-gray-600 mb-6 font-nunito">
              {feedback.message}
              {feedback.highlight ? (
                <Text className="text-green-600 font-nunito">
                  {feedback.highlight}
                </Text>
              ) : null}
              {feedback.emoji}
            </Text>

            {moduleQuizStatus && (
              <View>
                <Text className="text-base text-gray-600 mb-6 font-nunito">
                  Your last score: {moduleQuizStatus?.score}
                </Text>
              </View>
            )}

            <Button
              text={moduleQuizStatus ? "Retake Quiz" : "Start Quiz"}
              onPress={() => {
                setClickCount((prev) => prev + 1);
                router.push(`/quiz/courses/${selectedQuizId}`);
              }}
            />
          </View>
        )}
      </ScrollView>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 4,
          backgroundColor: colors.BACKGROUND, // Optional: to avoid transparency glitches
        }}
      >
        <BannerAdComponent />
      </View>
    </SafeScreen>
  );
}
