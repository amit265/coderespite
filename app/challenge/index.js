import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "../../services/storage";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { userDetailsContext } from "../../context/context";
import { CustomAlert } from "../../components/shared/GlobalAlert";

export default function DailyChallengeScreen() {
  const router = useRouter();
  const { userData } = useContext(userDetailsContext);
  const [loading, setLoading] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  useEffect(() => {
    // Check if challenge already completed today
    const checkCompletion = async () => {
      const today = new Date().toISOString().split("T")[0];
      const lastCompleted = await AsyncStorage.getItem("@daily_challenge_completed");
      if (lastCompleted === today) {
        setChallengeCompleted(true);
      }
    };
    checkCompletion();
  }, []);

  const handleStartChallenge = async () => {
    setLoading(true);
    try {
      // Load all bundled courses to extract quiz bank
      const bundledCourses = require("../../assets/data/all_courses_bundled.json");
      let allQuestions = [];
      
      // Extract all quizzes
      bundledCourses.forEach(course => {
        course.modules?.forEach(module => {
          if (module.quiz && Array.isArray(module.quiz)) {
            allQuestions = allQuestions.concat(module.quiz);
          }
        });
      });

      if (allQuestions.length === 0) {
        throw new Error("No questions available in the bank.");
      }

      // Shuffle and pick 5 questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const dailyQuiz = shuffled.slice(0, 5);
      
      if (dailyQuiz.length > 0) {
        await AsyncStorage.setItem(
          "@temp_ai_quiz",
          JSON.stringify({
            title: `Daily Challenge 📅`,
            quiz: dailyQuiz,
            isDailyChallenge: true, // Flag it so we can give bonus XP when completed
          })
        );
        router.push("/quiz/aiQuizScreen");
      } else {
        throw new Error("Empty quiz generated");
      }
    } catch (error) {
      console.error(error);
      CustomAlert.alert(
        "Challenge Issue",
        "We couldn't generate your challenge today. Please try again later.",
        [
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageTransition>
        <SafeScreen>
          <View style={styles.container}>
          {/* Custom Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0C1D59" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Challenge 🎯</Text>
            <View style={{ width: 24 }} /> {/* Spacer to balance flex header */}
          </View>
          
          <View style={styles.card}>
            <Text style={styles.emoji}>🔥</Text>
            <Text style={styles.cardTitle}>Today&apos;s Coding Challenge</Text>
            
            {challengeCompleted ? (
              <View style={styles.completedContainer}>
                <Text style={styles.completedEmoji}>✅</Text>
                <Text style={styles.completedText}>
                  You&apos;ve already completed today&apos;s challenge! Check back tomorrow for a new one.
                </Text>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: "#E5E7EB", marginTop: 20 }]} 
                  onPress={() => router.push("/(tabs)/index")}
                >
                  <Text style={[styles.btnText, { color: "#4B5563" }]}>Go to Home</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.cardDesc}>
                  Test your knowledge with 5 hand-picked questions curated for today. 
                  Complete it to earn bonus XP and secure your streak!
                </Text>
                
                <View style={styles.rewardsContainer}>
                  <Text style={styles.rewardText}>🎁 Rewards:</Text>
                  <Text style={styles.rewardItem}>• +50 Bonus XP</Text>
                  <Text style={styles.rewardItem}>• Streak secured</Text>
                </View>

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.PRIMARY} />
                    <Text style={styles.loadingText}>Generating today&apos;s challenge... 🐾</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.btn} onPress={handleStartChallenge}>
                    <Text style={styles.btnText}>Start Challenge 🚀</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
        </SafeScreen>
      </PageTransition>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "nunito-bold",
    color: "black",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  emoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "nunito-bold",
    color: "#0C1D59",
    marginBottom: 12,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 15,
    fontFamily: "nunito",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  rewardsContainer: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  rewardText: {
    fontSize: 16,
    fontFamily: "nunito-bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  rewardItem: {
    fontSize: 14,
    fontFamily: "nunito-semiBold",
    color: "#4B5563",
    marginLeft: 8,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: "#FFA500",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#0C1D59",
    fontSize: 18,
    fontFamily: "nunito-bold",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#4B5563",
    fontSize: 14,
    fontFamily: "nunito-semiBold",
  },
  completedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  completedEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  completedText: {
    fontSize: 16,
    fontFamily: "nunito-semiBold",
    color: "#10B981",
    textAlign: "center",
    paddingHorizontal: 20,
  }
});
