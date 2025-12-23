import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  Animated,
  Easing,
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
import PageTransition from "../../../../components/PageTransition";

// --- Animated Lesson Item Component ---
const AnimatedLessonItem = ({ lesson, index, onPress }) => {
  // 1. Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // 2. Press Interaction Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        marginBottom: 16,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ paddingHorizontal: 16 }}
      >
        <View 
          className="py-4 border border-gray-300 rounded-lg bg-gray-50"
          style={{
             // Add subtle shadow
             shadowColor: "#000",
             shadowOffset: { width: 0, height: 2 },
             shadowOpacity: 0.05,
             shadowRadius: 3,
             elevation: 2,
             backgroundColor: '#F9FAFB' // gray-50
          }}
        >
          <View className="flex flex-row justify-between items-center">
            <Text
              className="text-base font-nunito text-black px-6 py-2"
              style={{ flex: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {index + 1}. {lesson.title}
            </Text>
            {/* Optional: Add a small chevron icon to indicate clickability */}
            <View style={{ paddingRight: 16 }}>
                 <AntDesign name="right" size={16} color="#9CA3AF" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// --- Helper for Section Entrance ---
const FadeInSection = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

export default function ModuleId() {
  const { courseId, moduleId } = useLocalSearchParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const { allCourses, setSelectedQuiz, setSelectedLesson } = useContext(allCoursesContext);
  const { userData } = useContext(userDetailsContext);
  const [moduleQuizStatus, setModuleQuizStatus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);

  useEffect(() => {
    const sCourse = allCourses.find((course) => course.id === courseId);
    setSelectedCourse(sCourse);

    const sModule = sCourse?.modules?.find((module) => module.id === moduleId);
    setSelectedModule(sModule);

    const sQuizId = `quiz_${sModule?.id}`;
    setSelectedQuizId(sQuizId);
  }, [courseId, moduleId, allCourses]);

  useEffect(() => {
    if (selectedCourse && selectedQuizId) {
      const selectedQuiz = selectedCourse?.quizzes?.find(
        (quiz) => quiz.id === selectedQuizId
      );
      setSelectedQuiz(selectedQuiz);
    }
  }, [selectedCourse, selectedQuizId, setSelectedQuiz]);

  useEffect(() => {
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
  }, [selectedCourse, selectedModule, userData, selectedQuizId]);

  useEffect(() => {
    const feedbackData = getQuizFeedback(moduleQuizStatus?.score);
    setFeedback(feedbackData);
  }, [moduleQuizStatus]);

  const toggleLesson = (lesson) => {
    // Add small delay for the press animation
    setTimeout(() => {
        setSelectedLesson(lesson);
        router.push("/learn/courses/modules/lesson");
    }, 150);
  };

  if (!selectedCourse || !selectedModule) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg font-nunito">
          Module not found.
        </Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header */}
        <View
          className="flex flex-row w-full justify-start px-2 mb-4"
          style={{ backgroundColor: colors.BACKGROUND, gap: 8 }}
        >
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>
          <Text
            style={{
              fontFamily: "nunito-bold",
              color: colors.TEXT,
              textAlign: "left",
              flex: 1,
              fontSize: 20,
            }}
            numberOfLines={1}
          >
            {selectedCourse?.title} Module
          </Text>
        </View>

        <ScrollView
          className="flex"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.BACKGROUND }}
        >
          {/* Top Info Section */}
          <FadeInSection delay={0}>
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
                {moduleQuizStatus && (
                  <View className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                    <MaterialCommunityIcons
                      name="checkbox-marked-circle"
                      size={24}
                      color={
                        moduleQuizStatus?.score > 70 ? "#AAFF00" : "transparent"
                      }
                    />
                  </View>
                )}
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
                <View className="flex flex-row justify-between items-center gap-1 mt-1">
                  <View className="flex flex-row items-center gap-1">
                    <AntDesign name="book" size={16} color="gray" />
                    <Text className="text-sm font-nunito text-gray-700">
                      {selectedModule?.lessons?.length} Lessons
                    </Text>
                  </View>
                  {moduleQuizStatus && (
                    <View className="flex flex-row items-end gap-2">
                      <FontAwesome
                        name={moduleQuizStatus?.score > 70 ? "star" : "star-o"}
                        size={16}
                        color={moduleQuizStatus?.score > 70 ? "#AAFF00" : "#FF0000"}
                      />
                      <Text className="text-sm font-nunito text-gray-700">
                        {moduleQuizStatus?.score}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </FadeInSection>

          {/* Description */}
          <FadeInSection delay={100}>
            <View className="p-4">
              <Text className="text-sm font-nunito text-gray-700 text-justify leading-5">
                {selectedModule?.description}
              </Text>
            </View>
          </FadeInSection>

          {/* Lessons List - Staggered */}
          <View style={{ marginBottom: 40, marginTop: 10 }}>
            {selectedModule?.lessons?.map((lesson, index) => (
              <AnimatedLessonItem 
                key={lesson.lessonId}
                lesson={lesson}
                index={index}
                onPress={() => toggleLesson(lesson)}
              />
            ))}
          </View>

          {/* Feedback Section - Last to appear */}
          {feedback && (
            <FadeInSection delay={500}>
              <View
                className="bg-white p-6 mx-4 rounded-2xl shadow-md border border-gray-200"
                style={{ marginBottom: 120 }}
              >
                <Text className="text-xl font-nunito-bold text-black mb-3">
                  {feedback.title}
                </Text>

                <Text className="text-base text-gray-600 mb-6 font-nunito">
                  {feedback.message}
                  {feedback.highlight ? (
                    <Text className="text-green-600 font-nunito">
                      {" " + feedback.highlight}
                    </Text>
                  ) : null}
                  {" " + feedback.emoji}
                </Text>

                {moduleQuizStatus && (
                  <View>
                    <Text className="text-base text-gray-600 mb-6 font-nunito">
                      Your last score: {moduleQuizStatus?.score}
                    </Text>
                  </View>
                )}

                <Button
                  text={moduleQuizStatus ? "Retake Test" : "Start Test"}
                  onPress={() => {
                    setClickCount((prev) => prev + 1);
                    router.push(`/quiz/courses/${selectedQuizId}`);
                  }}
                />
              </View>
            </FadeInSection>
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
            backgroundColor: colors.BACKGROUND,
          }}
        >
          <BannerAdComponent />
        </View>
      </SafeScreen>
    </PageTransition>
  );
}