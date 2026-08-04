import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  BackHandler,
  Alert,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "../../services/storage";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import * as Haptics from "expo-haptics";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { userDetailsContext } from "../../context/context";

// --- Animated Option Component ---
const AnimatedOption = ({ item, isSelected, isChecked, isCorrectOption, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [isSelected]);

  let bg = "white";
  let border = "#E5E7EB";
  let textColor = colors.BLACK;

  if (isChecked) {
    if (isCorrectOption) {
      bg = "#DCFCE7"; // Light green
      border = "#10B981";
      textColor = "#065F46";
    } else if (isSelected) {
      bg = "#FEE2E2"; // Light red
      border = "#EF4444";
      textColor = "#991B1B";
    }
  } else if (isSelected) {
    bg = colors.PRIMARY;
    border = colors.PRIMARY;
    textColor = colors.WHITE;
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
        disabled={isChecked}
        style={[
          styles.optionButton,
          { backgroundColor: bg, borderColor: border }
        ]}
      >
        <Text style={[styles.optionText, { color: textColor, fontWeight: isSelected ? "bold" : "normal" }]}>
          {item}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AIQuizScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { gainXP } = useContext(userDetailsContext);

  const [quizTitle, setQuizTitle] = useState("AI Quiz");
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(true);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const stored = await AsyncStorage.getItem("@temp_ai_quiz");
        if (stored) {
          const parsed = JSON.parse(stored);
          setQuizTitle(parsed.title || "AI Quiz");
          setQuestions(parsed.quiz || []);
        } else {
          Alert.alert("Error", "No quiz template found.");
          router.back();
        }
      } catch (err) {
        console.error(err);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && questions[currentPage]?.options) {
      // Shuffle options for the current question
      setShuffledOptions(
        [...questions[currentPage].options].sort(() => Math.random() - 0.5)
      );
    }
  }, [currentPage, questions]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => backHandler.remove();
    }, [questions])
  );

  const goBack = () => {
    Alert.alert(
      "Confirm Exit",
      "Are you sure you want to exit the quiz? Your current progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => router.back() }
      ]
    );
  };

  const handleOptionSelect = (option) => {
    if (isChecked) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentPage];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }

    setIsChecked(true);

    setResult((prev) => ({
      ...prev,
      [currentPage]: {
        question: currentQ.question,
        userChoice: selectedOption,
        correctAns: currentQ.correctAnswer,
        isCorrect,
        explanation: currentQ.explanation || "",
      }
    }));
  };

  const handleNext = () => {
    if (currentPage < questions.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start(() => {
        setCurrentPage((prev) => prev + 1);
        setSelectedOption(null);
        setIsChecked(false);
        slideAnim.setValue(width);
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    } else {
      finishQuiz();
    }
  };

  const calculatePercent = () => {
    const correctCount = Object.values(result).filter((r) => r.isCorrect).length;
    return Math.round((correctCount / questions.length) * 100);
  };

  const finishQuiz = async () => {
    try {
      setLoading(true);
      const scorePercent = calculatePercent();
      
      // Award XP
      if (scorePercent > 0 && gainXP) {
        await gainXP(scorePercent * 0.5);
      }

      const attemptedDate = new Date().toISOString();
      const quizId = `ai_${Date.now()}`;
      
      const newAttempt = {
        quizId,
        quizIcon: "brain",
        result,
        quizResultPercentage: scorePercent,
        courseTitle: "AI Generated Quiz",
        quizTitle: quizTitle.replace("AI: ", ""),
        attemptedDate,
      };

      // Push attempt into history
      let attemptsArray = [];
      const storedAttempts = await AsyncStorage.getItem("@attemptedQuiz_data");
      if (storedAttempts) {
        const parsed = JSON.parse(storedAttempts);
        if (Array.isArray(parsed)) {
          attemptsArray = parsed;
        }
      }
      attemptsArray.push(newAttempt);
      await AsyncStorage.setItem("@attemptedQuiz_data", JSON.stringify(attemptsArray));

      router.replace({
        pathname: "/quiz/quizResultScreen",
        params: { quizIdParam: JSON.stringify(newAttempt) },
      });
    } catch (err) {
      console.error("Failed to finish AI quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
      </View>
    );
  }

  const currentQ = questions[currentPage];
  const progressValue = (currentPage + 1) / questions.length;

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{quizTitle}</Text>
            <View style={{ width: 30 }} />
          </View>

          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <Progress.Bar
              progress={progressValue}
              width={null}
              height={8}
              color={colors.PRIMARY}
              unfilledColor="#E5E7EB"
              borderWidth={0}
              borderRadius={4}
            />
            <Text style={styles.progressText}>
              Question {currentPage + 1} of {questions.length}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ transform: [{ translateX: slideAnim }], flex: 1 }}>
              {/* Question Box */}
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentQ.question}</Text>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                {shuffledOptions.map((item, index) => {
                  const isSelected = selectedOption === item;
                  const isCorrectOption = item === currentQ.correctAnswer;
                  return (
                    <AnimatedOption
                      key={index}
                      item={item}
                      isSelected={isSelected}
                      isChecked={isChecked}
                      isCorrectOption={isCorrectOption}
                      onSelect={() => handleOptionSelect(item)}
                    />
                  );
                })}
              </View>

              {/* Explanation section after answering */}
              {isChecked && currentQ.explanation && (
                <View style={styles.explanationCard}>
                  <Text style={styles.explanationTitle}>💡 Explanation</Text>
                  <Text style={styles.explanationText}>{currentQ.explanation}</Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          {/* Action Button Footer */}
          <View style={styles.footer}>
            {!isChecked ? (
              <TouchableOpacity
                style={[styles.footerBtn, !selectedOption && styles.disabledBtn]}
                disabled={!selectedOption}
                onPress={handleCheckAnswer}
              >
                <Text style={styles.footerBtnText}>Check Answer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.footerBtn} onPress={handleNext}>
                <Text style={styles.footerBtnText}>
                  {currentPage === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    fontFamily: "nunito-bold",
    maxWidth: "70%",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "nunito-semiBold",
    textAlign: "right",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "black",
    fontFamily: "nunito-bold",
  },
  optionsList: {
    marginBottom: 20,
  },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  optionText: {
    fontSize: 14,
    fontFamily: "nunito",
  },
  explanationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 6,
    fontFamily: "nunito-bold",
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
    fontFamily: "nunito",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerBtn: {
    backgroundColor: "#132F94",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledBtn: {
    backgroundColor: "#9CA3AF",
  },
  footerBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "nunito-bold",
  },
});
