import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "../../services/storage";
import colors from "../../constants/colors";
import { generateQuizWithGroq, getGroqApiKey } from "../../services/groqService";
import { userDetailsContext } from "../../context/context";

export default function DailyChallengeCard() {
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
      const activeKey = await getGroqApiKey();
      const topic = "General Web Development Trivia (HTML, CSS, JS, React, Python)";
      const generatedQuiz = await generateQuizWithGroq(topic, activeKey);
      
      if (generatedQuiz && generatedQuiz.length > 0) {
        await AsyncStorage.setItem(
          "@temp_ai_quiz",
          JSON.stringify({
            title: `Daily Challenge 📅`,
            quiz: generatedQuiz,
            isDailyChallenge: true, // Flag it so we can give bonus XP when completed
          })
        );
        router.push("/quiz/aiQuizScreen");
      } else {
        throw new Error("Empty quiz generated");
      }
    } catch (error) {
      Alert.alert(
        "Challenge Generation Issue",
        "We encountered an issue with the AI generation or network.",
        [
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.cardTitle}>Today's Coding Challenge</Text>
      
      {challengeCompleted ? (
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>✅</Text>
          <Text style={styles.completedText}>
            You've already completed today's challenge! Check back tomorrow for a new one.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.cardDesc}>
            Test your knowledge with 5 AI-generated questions curated for today. 
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
              <Text style={styles.loadingText}>Generating today's challenge... 🐾</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleStartChallenge}>
              <Text style={styles.btnText}>Start Challenge 🚀</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
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
