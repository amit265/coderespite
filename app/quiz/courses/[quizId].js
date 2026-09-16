import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from "expo-router";
import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as Progress from "react-native-progress";
import * as Haptics from "expo-haptics";

import AsyncStorage from "../../../services/storage";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  useWindowDimensions,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PageTransition from "../../../components/PageTransition";
import SafeScreen from "../../../components/SafeScreen";
import Button from "../../../components/shared/Button";
import colors from "../../../constants/colors";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../context/context";

import { CustomAlert } from "../../../components/shared/GlobalAlert";


// --- Animated Option Component ---
const AnimatedOption = ({ item, index, isSelected, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
        style={{
          padding: 16,
          borderWidth: isSelected ? 2 : 1,
          borderRadius: 15,
          marginTop: 12,
          backgroundColor: isSelected ? colors.PRIMARY : "white",
          borderColor: isSelected ? colors.PRIMARY : "#E5E7EB",
          shadowColor: isSelected ? colors.PRIMARY : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0.05,
          shadowRadius: 3,
          elevation: isSelected ? 4 : 1,
        }}
      >
        <Text
          style={{
            fontFamily: isSelected ? "nunito-bold" : "nunito",
            fontSize: 12,
            color: isSelected ? colors.WHITE : colors.BLACK,
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function QuizId() {
  const { width } = useWindowDimensions();
  const { quizId } = useLocalSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectOption, setSelectOption] = useState(false);
  const [result, setResult] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { updateCourse, userData, gainXP, logActivity } = useContext(userDetailsContext);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const { allCourses, selectedCourse, selectedQuiz, setSelectedCourse, setSelectedQuiz } =
    useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);

  const moduleId = quizId.replace("quiz_", "");
  const hasGainedXP = useRef(false);

  const resolvedCourse = useMemo(() => {
    const isInvalidId = !quizId || quizId === "undefined";
    if (!isInvalidId) {
      if (selectedCourse?.quizzes?.some((item) => item.id === quizId)) {
        return selectedCourse;
      }

      const found = allCourses.find((course) =>
        course.quizzes?.some((item) => item.id === quizId)
      );
      if (found) return found;
    }

    // Fallback: selected course or first course
    if (selectedCourse) return selectedCourse;
    if (allCourses.length > 0) return allCourses[0];
    return null;
  }, [allCourses, quizId, selectedCourse]);

  const resolvedQuiz = useMemo(() => {
    if (!resolvedCourse) return null;
    const isInvalidId = !quizId || quizId === "undefined";
    if (!isInvalidId) {
      if (selectedQuiz?.id === quizId) {
        return selectedQuiz;
      }

      const found = resolvedCourse.quizzes?.find((item) => item.id === quizId);
      if (found) return found;
    }

    // Fallback: first quiz of resolved course
    if (resolvedCourse.quizzes?.length > 0) {
      return resolvedCourse.quizzes[0];
    }
    return null;
  }, [quizId, resolvedCourse, selectedQuiz]);

  const courseTitle = resolvedCourse?.title;
  const courseId = resolvedCourse?.id;
  const quizTitle = resolvedQuiz?.title;
  const quiz = resolvedQuiz?.quiz;
  const quizIcon = resolvedCourse?.icon;

  // Animation Ref for the Question Card Slide
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resolvedCourse && resolvedCourse.id !== selectedCourse?.id) {
      setSelectedCourse(resolvedCourse);
    }

    if (resolvedQuiz && resolvedQuiz.id !== selectedQuiz?.id) {
      setSelectedQuiz(resolvedQuiz);
    }
  }, [resolvedCourse, resolvedQuiz, selectedCourse, selectedQuiz, setSelectedCourse, setSelectedQuiz]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        goBack(); // Trigger your custom alert
        return true; // Return true to prevent default behavior (exiting)
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [resolvedQuiz])
  );

  useEffect(() => {
    if (quiz && quiz[currentPage]?.options) {
      setShuffledOptions(
        [...quiz[currentPage].options].sort(() => Math.random() - 0.5)
      );
    }
  }, [currentPage, quiz]);

  const getProgress = (currentPage) => {
    return (currentPage + 1) / (quiz?.length || 1);
  };

  const onOptionSelect = (selectedChoice) => {
    const isCorrect = quiz[currentPage]?.correctAnswer === selectedChoice;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }

    setResult((prev) => ({
      ...prev,
      [currentPage]: {
        userChoice: selectedChoice,
        isCorrect: isCorrect,
        question: quiz[currentPage]?.question,
        correctAns: quiz[currentPage]?.correctAnswer,
        explanation: quiz[currentPage]?.explanation || "",
      },
    }));
  };

  const calculateQuizPercent = () => {
    if (!quiz || !result) return 0;
    const correctAnswers = Object.values(result).filter(
      (q) => q.isCorrect
    ).length;
    return ((correctAnswers / quiz.length) * 100).toFixed(0);
  };

  const handleNextQuestion = () => {
    // 1. Slide OUT to Left
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(() => {
      // 2. Update State (Hidden)
      setCurrentPage((prev) => prev + 1);
      setSelectedOption(null);
      setSelectOption(false);

      // 3. Reset Position to Right (Instant)
      slideAnim.setValue(width);

      // 4. Slide IN from Right
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  };

  const goBack = () => {
    CustomAlert.alert(
      "Confirm Exit",
      "Are you sure you want to go back? You will lose your progress.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", style: "destructive", onPress: () => router.back() },
      ]
    );
  };

  const onQuizFinish = async () => {
    if (hasGainedXP.current) return;
    hasGainedXP.current = true;
    try {
      setLoading(true);
      const quizResultPercentage = calculateQuizPercent();

      const now = new Date();
      const attemptedDate = now.toISOString();

      const newAttempt = {
        quizId,
        quizIcon,
        result,
        quizResultPercentage,
        courseTitle,
        quizTitle,
        attemptedDate,
      };

      let attemptsArray = [];
      const storedAttempts = await AsyncStorage.getItem("@attemptedQuiz_data");
      const parsed = storedAttempts ? JSON.parse(storedAttempts) : null;

      if (Array.isArray(parsed)) {
        attemptsArray = parsed;
      } else if (parsed) {
        attemptsArray = [parsed];
      }

      attemptsArray = attemptsArray.filter(
        (attempt) =>
          !(attempt.quizId === quizId && attempt.courseTitle === courseTitle)
      );

      attemptsArray.push(newAttempt);
      await AsyncStorage.setItem(
        "@attemptedQuiz_data",
        JSON.stringify(attemptsArray)
      );

      const currentProgress = userData?.progress?.[courseTitle] || {};
      const previousAttempts = currentProgress?.attemptedQuizzes || [];
      const filtered = previousAttempts.filter((q) => q.id !== quizId);

      const detailedQuizData = {
        id: quizId,
        courseTitle,
        moduleId,
        courseId,
        score: quizResultPercentage,
        date: attemptedDate,
      };

      await updateCourse(courseTitle, {
        attemptedQuizzes: [...filtered, detailedQuizData],
      });

      if (logActivity) {
        await logActivity();
      }

      router.replace({
        pathname: "/quiz/quizResultScreen",
        params: { quizIdParam: JSON.stringify(newAttempt) },
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) {
    if (allCourses.length > 0) {
      return (
        <SafeScreen>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.ERROR} />
            <Text style={{ fontSize: 22, fontFamily: "nunito-bold", color: "#1F2937", marginTop: 16, marginBottom: 8, textAlign: "center" }}>Quiz Not Found</Text>
            <Text style={{ fontSize: 15, fontFamily: "nunito", color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 22 }}>
              {"We couldn't resolve the requested practice quiz."}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/quiz")}
              style={{ backgroundColor: colors.PRIMARY, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
            >
              <Text style={{ color: "white", fontSize: 16, fontFamily: "nunito-bold" }}>Back to Quizzes</Text>
            </TouchableOpacity>
          </View>
        </SafeScreen>
      );
    }
    return (
      <SafeScreen>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <PageTransition>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeScreen>
        <View style={{ flex: 1 }}>
          {/* Top Bar */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              marginBottom: 10,
            }}
          >
            <Pressable onPress={goBack} hitSlop={10}>
              <Ionicons name="close" size={30} color="black" />
            </Pressable>

            {/* Progress Bar in center */}
            <View style={{ flex: 1, marginHorizontal: 16 }}>
              <Progress.Bar
                progress={getProgress(currentPage)}
                width={null} // auto width
                color={colors.PRIMARY}
                unfilledColor="#E5E7EB"
                borderWidth={0}
                height={8}
                borderRadius={4}
                style={{ width: "100%" }}
              />
            </View>

            <Text
              style={{
                fontFamily: "nunito-bold",
                fontSize: 16,
                color: colors.GRAY,
              }}
            >
              {currentPage + 1}/{quiz?.length}
            </Text>
          </View>

          {/* Question Title (Fixed) */}
          <Text
            style={{
              textAlign: "center",
              fontFamily: "nunito-bold",
              fontSize: 14,
              color: "#9CA3AF",
              marginBottom: 10,
            }}
          >
            {quizTitle}
          </Text>

          {/* Animated Question Card */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          >
            <Animated.View
              style={{
                transform: [{ translateX: slideAnim }], // Binds the slide animation
              }}
            >
              <View
                style={{
                  backgroundColor: colors.WHITE,
                  borderRadius: 24,
                  marginHorizontal: 16,
                  padding: 24,
                  // Soft Shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 4,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "nunito-bold",
                    fontSize: 16,
                    textAlign: "left",
                    marginBottom: 24,
                    lineHeight: 28,
                  }}
                >
                  {quiz[currentPage]?.question}
                </Text>

                <View>
                  {shuffledOptions.map((item, index) => (
                    <AnimatedOption
                      key={`${currentPage}-${index}`} // Force re-render on page change to reset animations
                      item={item}
                      index={index}
                      isSelected={selectedOption === index}
                      onSelect={() => {
                        setSelectedOption(index);
                        setSelectOption(true);
                        onOptionSelect(item);
                      }}
                    />
                  ))}
                </View>
              </View>

              <View
                style={{
                  paddingHorizontal: 21,
                  paddingBottom: 20,
                }}
              >
                {quiz?.length - 1 > currentPage ? (
                  <Button
                    text="Next Question"
                    onPress={handleNextQuestion}
                    disable={!selectOption}
                    variant={selectOption ? "active" : "inactive"}
                  />
                ) : (
                  <Button
                    text="Submit Quiz"
                    onPress={() => {
                      setClickCount((prev) => prev + 1);
                      onQuizFinish();
                    }}
                    loading={loading}
                    disable={!selectOption}
                    variant={selectOption ? "active" : "inactive"}
                    backgroundColor={colors.SUCCESS} // Green for finish
                  />
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </View>

        {/* Bottom Banner Ad */}
        
      </SafeScreen>
    </PageTransition>
  );
}
