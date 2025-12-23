import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import Button from "../../components/shared/Button";
import colors from "../../constants/colors";
import { allCoursesContext, userDetailsContext } from "../../context/context";
import { BannerAdComponent } from "../../services/AdManager";

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
  const { quizIdParam } = useLocalSearchParams();
  const { setSelectedCourse, setSelectedQuiz, allCourses } =
    useContext(allCoursesContext);
  const { gainXP } = useContext(userDetailsContext);

  const quizData = quizIdParam ? JSON.parse(quizIdParam) : null;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getPercMarks = quizData?.quizResultPercentage || 0;
  const quizResult = quizData?.result || {};

  useEffect(() => {
    if (getPercMarks > 0) {
      gainXP(getPercMarks * 0.5);
    }
  }, []);

  useEffect(() => {
    if (!quizData) {
      setLoading(true);
    } else {
      setLoading(false);
      // Only show confetti if score is good (> 60%)
      if (getPercMarks > 60) {
        setTimeout(() => setShowConfetti(true), 500);
      }
    }
  }, [quizData]);

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
    const quizItem = item[1];
    return (
      <AnimatedResultItem index={index}>
        <View
          style={{
            padding: 20,
            borderWidth: 1,
            marginHorizontal: 5,
            marginTop: 10, // increased margin for spacing
            borderRadius: 20, // rounded corners
            backgroundColor: quizItem?.isCorrect
              ? "#DCFCE7" // light green (Tailwind green-100)
              : "#FEE2E2", // light red (Tailwind red-100)
            borderColor: quizItem?.isCorrect ? "#86EFAC" : "#FCA5A5",
          }}
        >
          <Text
            style={{ fontFamily: "nunito-bold", fontSize: 16, marginBottom: 8 }}
          >
            {quizItem?.question}
          </Text>

          {!quizItem?.isCorrect && (
            <Text
              style={{
                fontFamily: "nunito",
                fontSize: 15,
                color: colors.ERROR,
              }}
            >
              Your Answer: {quizItem?.userChoice}
            </Text>
          )}

          <Text
            style={{
              fontFamily: "nunito-bold",
              fontSize: 15,
              color: colors.PRIMARY,
              marginTop: 4,
            }}
          >
            {!quizItem?.isCorrect ? "Correct Answer" : "Answer"}:{" "}
            {quizItem?.correctAns}
          </Text>

          {quizItem?.explanation && (
            <View
              style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: "rgba(255,255,255,0.5)",
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "nunito",
                  fontSize: 14,
                  color: "#4B5563",
                  textAlign: "justify",
                }}
              >
                💡 {quizItem?.explanation}
              </Text>
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
          {/* Confetti Overlay */}
          {showConfetti && (
            <View
              pointerEvents="none" // Ensure touches pass through
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("../../assets/fun.json")}
                autoPlay
                loop={false}
                onAnimationFinish={() => setShowConfetti(false)}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          )}

          {loading && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color="black" size={36} />
            </View>
          )}

          <FlatList
            data={quizResult ? Object.entries(quizResult) : []}
            renderItem={renderItem}
            style={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View>
                {/* Header */}
                <View className="flex flex-row items-center gap-2 mb-4">
                  <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Ionicons name="close" size={30} color="black" />
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: "nunito-bold",
                      fontSize: 20,
                      color: colors.BLACK,
                    }}
                  >
                    Quiz Summary
                  </Text>
                </View>

                {quizData?.result ? (
                  <View style={{ width: "100%", paddingHorizontal: 20 }}>
                    {/* Animated Score Card */}
                    <AnimatedScoreCard>
                      <View
                        style={{
                          backgroundColor: colors.WHITE,
                          padding: 24,
                          borderRadius: 24,
                          marginTop: 40,
                          alignItems: "center",
                          // Shadow
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.1,
                          shadowRadius: 10,
                          elevation: 5,
                        }}
                      >
                        <Image
                          source={require("../../assets/images/trophy.png")}
                          style={{ width: 100, height: 100, marginTop: -70 }}
                        />
                        <Text
                          style={{
                            fontSize: 24,
                            fontFamily: "nunito-bold",
                            marginTop: 10,
                          }}
                        >
                          {getPercMarks > 60
                            ? "Congratulations!"
                            : "Keep Practicing!"}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "nunito",
                            color: colors.GRAY,
                            textAlign: "center",
                            fontSize: 16,
                            marginTop: 4,
                          }}
                        >
                          You scored {getPercMarks}%
                        </Text>

                        {/* Stats Row */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 20,
                            width: "100%",
                            gap: 10,
                          }}
                        >
                          <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total</Text>
                            <Text style={styles.statValue}>
                              {totalQuestion}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statBox,
                              { backgroundColor: "#DCFCE7" },
                            ]}
                          >
                            <Text
                              style={[styles.statLabel, { color: "#166534" }]}
                            >
                              Correct
                            </Text>
                            <Text
                              style={[styles.statValue, { color: "#166534" }]}
                            >
                              {correctAns}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statBox,
                              { backgroundColor: "#FEE2E2" },
                            ]}
                          >
                            <Text
                              style={[styles.statLabel, { color: "#991B1B" }]}
                            >
                              Wrong
                            </Text>
                            <Text
                              style={[styles.statValue, { color: "#991B1B" }]}
                            >
                              {totalQuestion - correctAns}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </AnimatedScoreCard>

                    {/* Buttons */}
                    <View style={{ marginTop: 24 }}>
                      <Button text={"Attempt Again"} onPress={attemptAgain} />
                      <Button
                        text={"Back to Home"}
                        onPress={() => router.replace("/(tabs)")}
                        type="outline" // Assuming Button supports outline/text only
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

        <View>
          <BannerAdComponent />
        </View>
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
    fontSize: 18,
    color: "#111827",
  },
});
