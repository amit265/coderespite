import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { generateQuizWithGroq, getGroqApiKey } from "../../services/groqService";

export default function AIGenerator() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      Alert.alert("Topic Required", "Please enter a topic or select one below.");
      return;
    }

    setLoading(true);
    try {
      const activeKey = await getGroqApiKey();
      const generatedQuiz = await generateQuizWithGroq(cleanTopic, activeKey);
      if (generatedQuiz && generatedQuiz.length > 0) {
        await AsyncStorage.setItem(
          "@temp_ai_quiz",
          JSON.stringify({
            title: `AI: ${cleanTopic}`,
            quiz: generatedQuiz,
          })
        );
        router.push("/quiz/aiQuizScreen");
      } else {
        throw new Error("Empty quiz generated");
      }
    } catch (error) {
      Alert.alert(
        "AI Generation Issue",
        "We encountered an issue with the Groq API key or network. Please verify or update your key in the AI Configuration Guide under Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: () => router.push("/settings") },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
            <Text style={styles.headerTitle}>🤖 AI Quiz Generator</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📝 Select Quiz Topic</Text>
              <Text style={styles.cardDesc}>
                {"Enter any coding topic (e.g. \"React Hooks\", \"CSS Flexbox\", \"SQL Joins\") and our AI will generate a fresh 5-question test for you!"}
              </Text>
              <TextInput
                style={styles.topicInput}
                placeholder="Enter topic..."
                placeholderTextColor="#9CA3AF"
                value={topic}
                onChangeText={setTopic}
              />
              <Text style={styles.subTitle}>Quick Topics:</Text>
              <View style={styles.chipRow}>
                {["JavaScript", "HTML", "CSS", "React", "Git"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, topic.toLowerCase() === item.toLowerCase() && styles.activeChip]}
                    onPress={() => handleQuickSelect(item)}
                  >
                    <Text style={[styles.chipText, topic.toLowerCase() === item.toLowerCase() && styles.activeChipText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.PRIMARY} />
                <Text style={styles.loadingText}>Meowgrammer is compiling your quiz... 🐾</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
                <Text style={styles.generateBtnText}>Generate Custom Quiz 🚀</Text>
              </TouchableOpacity>
            )}

            <View style={[styles.card, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A", borderWidth: 1, marginTop: 24, padding: 16 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Ionicons name="warning" size={20} color="#D97706" />
                <Text style={{ fontFamily: "quicksand-bold", fontSize: 14, color: "#92400E" }}>
                  AI Generation Safety & Disclaimer
                </Text>
              </View>
              <Text style={{ fontFamily: "nunito", fontSize: 12, color: "#B45309", lineHeight: 18 }}>
                {"Quizzes are generated dynamically by artificial intelligence. Results may contain errors or hallucinations. By generating content, you agree not to submit offensive or harmful prompts."}
              </Text>
            </View>
          </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    fontFamily: "nunito-bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0C1D59",
    marginBottom: 8,
    fontFamily: "nunito-bold",
  },
  cardDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
    fontFamily: "nunito",
  },
  saveButton: {
    backgroundColor: "#132F94",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: "nunito-bold",
  },
  topicInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    color: "black",
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "nunito",
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 10,
    fontFamily: "nunito-bold",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeChip: {
    backgroundColor: "#132F94",
    borderColor: "#132F94",
  },
  chipText: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "nunito",
  },
  activeChipText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "nunito-bold",
  },
  generateBtn: {
    backgroundColor: "#FFA500",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  generateBtnText: {
    color: "#0C1D59",
    fontSize: 17,
    fontWeight: "bold",
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
});
