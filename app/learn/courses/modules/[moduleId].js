import { Ionicons } from "@expo/vector-icons";
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
        className="flex flex-row gap-2 py-4 px-2"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={25} color="black" />
        </Pressable>
        <Text className="text-xl font-quicksand-bold mb-2 text-gray-900">
          {selectedCourse?.title} Module
        </Text>
      </View>

      <ScrollView
        className="flex px-6"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <View className="flex flex-row gap-4 p-4">
          <View style={{ width: 150, height: 150 }}>
            <Image
              source={courseIcons[selectedCourse?.icon]||
                require("../../../../assets/default-icon.png")}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 20,
              }}
            />
          </View>
          <View className="flex-1 gap-2 justify-center">
            <Text className="text-gray-700 text-lg font-nunito-semibold">
              {selectedModule?.title}
            </Text>
            <Text className="text-sm font-nunito-semibold text-gray-700">
              Level: {selectedModule?.level}
            </Text>
            <Text className="text-sm font-nunito-semibold text-gray-700">
              📘 {selectedModule?.lessons?.length} Lessons
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-base font-nunito-semibold text-gray-700">
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
                  <View className="flex flex-row justify-between items-center mb-2">
                    <Text className="text-base font-nunito-semibold text-gray-800 px-2">
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
                        <Text className="text-gray-700 font-nunito px-2">
                          {lesson.content}
                        </Text>
                      )}
                      {lesson.type === "code" && (
                        <View className="bg-gray-900 rounded p-3 mt-2">
                          <Text className="text-green-400 font-nunito px-2">
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
            <Text className="text-xl font-nunito-bold text-gray-800 mb-3">
              {feedback.title}
            </Text>

            <Text className="text-base text-gray-600 mb-6">
              {feedback.message}
              {feedback.highlight ? (
                <Text className="text-green-600 font-nunito-semibold">
                  {feedback.highlight}
                </Text>
              ) : null}
              {feedback.emoji}
            </Text>

            {moduleQuizStatus && (
              <View>
                <Text>Your last score: {moduleQuizStatus?.score}</Text>
              </View>
            )}

            <Button
              text={moduleQuizStatus ? "Retake Quiz" : "Start Quiz"}
              onPress={() => {
                setClickCount(prev => prev + 1)
                router.push(`/quiz/courses/${selectedQuizId}`)}}
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
