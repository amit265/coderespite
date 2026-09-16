import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "../../services/storage";
import LottieView from "lottie-react-native";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Share,
  TouchableOpacity,
  Platform,
} from "react-native";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import Button from "../../components/shared/Button";
import colors from "../../constants/colors";
import { EmojiText, DESTYA_SHARE_LINK } from "../../constants/constants";
import { allCoursesContext, userDetailsContext, adConfigContext } from "../../context/context";
import { BannerAdComponent, showInterstitialAd } from "../../services/AdManager";
import { logAnalyticsEvent } from "../../services/analyticsService";
import Markdown from "react-native-markdown-display";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

// --- Animated Score Card (Entrance) ---
const AnimatedScoreCard = ({ children }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}
    >
      {children}
    </Animated.View>
  );
};

// --- Animated Result Item (Staggered) ---
const AnimatedResultItem = ({ children, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100 + 300, // Wait for score card first
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        delay: index * 100 + 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function QuizResultScreen() {
  const { quizIdParam, history } = useLocalSearchParams();
  const { setSelectedCourse, setSelectedQuiz, allCourses } =
    useContext(allCoursesContext);
  const { gainXP } = useContext(userDetailsContext);
  const { adConfig } = useContext(adConfigContext);

  const quizData = useMemo(() => {
    return quizIdParam ? JSON.parse(quizIdParam) : null;
  }, [quizIdParam]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getPercMarks = Number(quizData?.quizResultPercentage ?? 0);
  const quizResult = quizData?.result || {};

  useEffect(() => {
    if (getPercMarks > 0) {
      gainXP(getPercMarks * 0.5);
    }
    if (quizData) {
      logAnalyticsEvent("quiz_completed", {
        quizId: quizData.quizId || "unknown",
        courseTitle: quizData.courseTitle || "unknown",
        quizTitle: quizData.quizTitle || "unknown",
        score: getPercMarks,
      });
      // Show Interstitial ad as a natural break point after quiz completion
      showInterstitialAd(adConfig);
    }
  }, [quizData]);

  useEffect(() => {
    if (!quizData) {
      setLoading(true);
    } else {
      setLoading(false);
      // Only show confetti if score is good (> 60%)
      const isHistory = history === "true" || history === true;
      if (getPercMarks >= 60 && !isHistory) {
        setTimeout(() => setShowConfetti(true), 500);
      }

      // If they scored 100%, check if we should prompt for a review
      if (getPercMarks === 100 && !isHistory) {
        setTimeout(async () => {
          try {
            const hasPrompted = await AsyncStorage.getItem("hasPromptedReview");
            if (!hasPrompted && await StoreReview.hasAction()) {
              await StoreReview.requestReview();
              await AsyncStorage.setItem("hasPromptedReview", "true");
            }
          } catch (err) {
            console.log("StoreReview error:", err);
          }
        }, 1500); // Wait a bit so it doesn't instantly interrupt confetti
      }
    }
  }, [quizData, history]);

  const { correctAns, totalQuestion } = useMemo(() => {
    if (!quizData?.result) return { correctAns: 0, totalQuestion: 0 };
    const correctAns_ = Object.entries(quizData.result)?.filter(
      ([, value]) => value?.isCorrect === true
    );
    return {
      correctAns: correctAns_.length,
      totalQuestion: Object.keys(quizData.result).length,
    };
  }, [quizData]);


  const viewShotRef = useRef(null);

  const handleShareScore = async () => {
    try {
      if (Platform.OS === 'web') {
        const message = `I scored ${getPercMarks}% on "${quizData?.quizTitle || 'Quiz'}" in CodeRespite! Can you beat my score? 🐾\n\n${DESTYA_SHARE_LINK}`;
        await Share.share({ message });
      } else {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              dialogTitle: `I scored ${getPercMarks}% on CodeRespite!`,
              mimeType: "image/jpeg"
            });
          }
        }
      }
      logAnalyticsEvent("score_shared", {
        quizId: quizData?.quizId || "unknown",
        score: getPercMarks
      });
    } catch (error) {
      console.log("[QuizResult] Share failed:", error);
    }
  };

  const attemptAgain = () => {
    const currentCourse = allCourses.find(
      (item) => item.title === quizData?.courseTitle
    );
    const currentQuiz = currentCourse?.quizzes.find(
      (item) => item?.id === quizData?.quizId
    );
    setSelectedQuiz(currentQuiz);
    setSelectedCourse(currentCourse);
    router.replace(`/quiz/courses/${quizData?.quizId}`);
  };

  const renderItem = ({ item, index }) => {
    // ... existing renderItem code ...
    const quizItem = item[1];
    const userAnswer = quizItem?.userChoice ?? "Not answered";
    const correctAnswer = quizItem?.correctAns ?? "Not available";
    const questionText = quizItem?.question ?? "Question unavailable";

    return (
      <AnimatedResultItem index={index}>
        <View
          style={{
            padding: 20,
            borderWidth: 1,
            marginHorizontal: 5,
            marginTop: 10,
            borderRadius: 20,
            backgroundColor: quizItem?.isCorrect ? "#DCFCE7" : "#FEE2E2",
            borderColor: quizItem?.isCorrect ? "#86EFAC" : "#FCA5A5",
          }}
        >
          <Text style={{ fontFamily: "nunito-bold", fontSize: 16, marginBottom: 8 }}>{questionText}</Text>
          {!quizItem?.isCorrect && (
            <Text style={{ fontFamily: "nunito", fontSize: 15, color: colors.ERROR }}>
              Your Answer: {userAnswer}
            </Text>
          )}
          <Text style={{ fontFamily: "nunito-bold", fontSize: 15, color: colors.PRIMARY, marginTop: 4 }}>
            {!quizItem?.isCorrect ? "Correct Answer" : "Answer"}: {correctAnswer}
          </Text>
          {quizItem?.explanation && (
            <View style={{ marginTop: 8, padding: 10, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 10 }}>
              <Markdown style={markdownStyles}>{`💡 ${quizItem?.explanation}`}</Markdown>
            </View>
          )}
        </View>
      </AnimatedResultItem>
    );
  };

  return (
    <PageTransition>
      <SafeScreen>
        <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
          {showConfetti && (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, justifyContent: "center", alignItems: "center" }}>
              <LottieView source={require("../../assets/fun.json")} autoPlay loop={false} onAnimationFinish={() => setShowConfetti(false)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>
          )}
          {loading && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color="black" size={36} />
            </View>
          )}
          <FlashList
            estimatedItemSize={100}
            data={quizResult ? Object.entries(quizResult) : []}
            renderItem={renderItem}
            style={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View>
                <View className="flex flex-row items-center gap-2 mb-4">
                  <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Ionicons name="close" size={30} color="black" />
                  </Pressable>
                  <Text style={{ fontFamily: "nunito-bold", fontSize: 20, color: colors.BLACK }}>Quiz Summary</Text>
                </View>

                {quizData?.result ? (
                  <View style={{ width: "100%", paddingHorizontal: 20 }}>
                    <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
                      <AnimatedScoreCard>
                        <View
                          style={{
                            backgroundColor: colors.WHITE,
                            padding: 24,
                            borderRadius: 24,
                            marginTop: 40,
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 5,
                          }}
                        >
                          <Image source={require("../../assets/images/trophy.png")} style={{ width: 100, height: 100, marginTop: -70 }} />
                          <Text style={{ fontSize: 24, fontFamily: "nunito-bold", marginTop: 10 }}>
                            {getPercMarks > 60 ? "Congratulations!" : "Keep Practicing!"}
                          </Text>
                          <Text style={{ fontFamily: "nunito", color: colors.GRAY, textAlign: "center", fontSize: 16, marginTop: 4 }}>
                            You scored {getPercMarks}%
                          </Text>

                          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20, width: "100%", gap: 10 }}>
                            <View style={styles.statBox}>
                              <Text style={styles.statLabel}>Total</Text>
                              <Text style={styles.statValue}>{totalQuestion}</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: "#DCFCE7" }]}>
                              <Text style={[styles.statLabel, { color: "#166534" }]}>Correct</Text>
                              <Text style={[styles.statValue, { color: "#166534" }]}>{correctAns}</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: "#FEE2E2" }]}>
                              <Text style={[styles.statLabel, { color: "#991B1B" }]}>Wrong</Text>
                              <Text style={[styles.statValue, { color: "#991B1B" }]}>{totalQuestion - correctAns}</Text>
                            </View>
                          </View>
                        </View>
                      </AnimatedScoreCard>
                    </ViewShot>

                    <View style={{ marginTop: 24, gap: 10 }}>
                      <Button text={"Attempt Again"} onPress={attemptAgain} />
                      <Button text={"Share Score 📤"} onPress={handleShareScore} />
                      <Button
                        text={"Back to Home"}
                        onPress={() => router.replace("/(tabs)")}
                        type="outline"
                        backgroundColor="transparent"
                        color={colors.PRIMARY}
                      />
                    </View>

                    <View style={{ marginTop: 30, marginBottom: 10 }}>
                      <Text
                        style={{
                          fontFamily: "nunito-bold",
                          fontSize: 20,
                          color: colors.BLACK,
                          textAlign: "left",
                        }}
                      >
                        Detailed Review
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>

        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontFamily: "nunito",
    fontSize: 12,
    color: "#6B7280",
  },
  statValue: {
    fontFamily: "nunito-bold",
    fontSize: 22,
    color: "#4F46E5",
    marginTop: 4,
  },
});

// Markdown styles for brief explanations
const markdownStyles = {
  body: {
    fontFamily: "nunito",
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  strong: {
    fontFamily: "nunito-bold",
    color: "#1F2937",
  },
  code_inline: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 13,
    backgroundColor: "#E5E7EB",
    color: "#4B5563",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
};
