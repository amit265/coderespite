import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import * as Progress from "react-native-progress";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
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
import { BannerAdComponent } from "../../../services/AdManager";

const { width, height } = Dimensions.get("window");

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
  const { quizId } = useLocalSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectOption, setSelectOption] = useState(false);
  const [result, setResult] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { updateCourse, userData, gainXP } = useContext(userDetailsContext);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const { selectedCourse, selectedQuiz } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);

  const courseTitle = selectedCourse?.title;
  const courseId = selectedCourse?.id;
  const quizTitle = selectedQuiz?.title;
  const moduleId = quizId.replace("quiz_", "");
  const quiz = selectedQuiz?.quiz;
  const quizIcon = selectedCourse?.icon;
  const hasGainedXP = useRef(false);

  // Animation Ref for the Question Card Slide
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const backAction = () => {
      goBack(); // Trigger your custom alert
      return true; // Return true to prevent default behavior (exiting)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

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
    setResult((prev) => ({
      ...prev,
      [currentPage]: {
        userChoice: selectedChoice,
        isCorrect: quiz[currentPage]?.correctAnswer === selectedChoice,
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
    Alert.alert(
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
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateX: slideAnim }], // Binds the slide animation
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  backgroundColor: colors.WHITE,
                  borderRadius: 24,
                  flex: 1,
                  marginHorizontal: 16,
                  padding: 24,
                  // Soft Shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 4,
                  maxHeight: height * 0.65,
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

                <ScrollView>
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
                </ScrollView>

                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    paddingHorizontal: 5,
                    bottom: -80,
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
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Bottom Banner Ad */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <BannerAdComponent />
        </View>
      </SafeScreen>
    </PageTransition>
  );
}
