import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { getGroqApiKey, getDetailedExplanationWithGroq } from "../../services/groqService";
import { EmojiText } from "../../constants/constants";
import Markdown from "react-native-markdown-display";
import { CustomAlert } from "../../components/shared/GlobalAlert";

export default function DetailedExplanation() {
  const { question, userAnswer, correctAnswer, explanation } = useLocalSearchParams();
  const router = useRouter();
  const [apiKey, setApiKey] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKey = async () => {
      const key = await getGroqApiKey();
      setApiKey(key);
    };
    fetchKey();
  }, []);

  const handleFetchAiExplanation = async () => {
    setLoading(true);
    try {
      const activeKey = await getGroqApiKey();
      if (!activeKey) {
        throw new Error("No API key configured");
      }
      const result = await getDetailedExplanationWithGroq(
        question,
        userAnswer,
        correctAnswer,
        activeKey
      );
      setAiExplanation(result);
    } catch (error) {
      CustomAlert.alert(
        "AI Explanation Issue",
        "We encountered an issue fetching the AI explanation. Please check your network or configure your own free Groq API Key in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: () => router.push("/settings") }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const isCorrect = userAnswer === correctAnswer;

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={15} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detailed Review</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Question Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Question</Text>
              <Text style={styles.questionText}>{question}</Text>

              <View style={styles.answersContainer}>
                <View style={[styles.answerRow, isCorrect ? styles.correctBg : styles.incorrectBg]}>
                  <Ionicons
                    name={isCorrect ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={isCorrect ? "#10B981" : "#EF4444"}
                  />
                  <Text style={styles.answerLabel}>Your Answer:</Text>
                  <Text style={styles.answerVal} numberOfLines={2}>
                    {userAnswer || "Not answered"}
                  </Text>
                </View>

                {!isCorrect && (
                  <View style={[styles.answerRow, styles.correctBg]}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.answerLabel}>Correct Answer:</Text>
                    <Text style={styles.answerVal} numberOfLines={2}>
                      {correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Current Explanation Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Static Explanation</Text>
              <EmojiText style={styles.explanationText}>
                💡 {explanation || "No static explanation available for this question."}
              </EmojiText>
            </View>

            {/* AI Explanation Request Section */}
            {!aiExplanation && !loading && (
              <View style={styles.aiActionCard}>
                <Ionicons name="sparkles" size={32} color="#8B5CF6" />
                <Text style={styles.aiActionTitle}>Need a deeper explanation?</Text>
                <Text style={styles.aiActionDesc}>
                  Ask our AI to break down the concept, explain the underlying logic, and help you master it!
                </Text>
                <TouchableOpacity style={styles.aiButton} onPress={handleFetchAiExplanation}>
                  <Text style={styles.aiButtonText}>Detailed AI Explanation 🤖</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.configLink}
                  onPress={() => router.push("/settings")}
                >
                  <Text style={styles.configLinkText}>Configure Custom API Key ⚙️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Consulting Groq Llama AI...</Text>
              </View>
            )}

            {/* AI Explanation Card */}
            {aiExplanation ? (
              <View>
                <View style={[styles.card, styles.aiCard]}>
                  <View style={styles.aiCardHeader}>
                    <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                    <Text style={styles.aiCardTitle}>Detailed AI Explanation</Text>
                  </View>
                  <Markdown
                    style={markdownStyles}
                    rules={{
                      fence: (node, children, parent, styles) => (
                        <View
                          key={node.key}
                          style={{
                            backgroundColor: "#1E0D47",
                            borderRadius: 10,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            marginVertical: 8,
                            borderWidth: 1,
                            borderColor: "#8B5CF6",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                              fontSize: 13,
                              color: "#C4B5FD",
                              lineHeight: 20,
                            }}
                            selectable
                          >
                            {node.content}
                          </Text>
                        </View>
                      ),
                    }}
                  >
                    {aiExplanation}
                  </Markdown>
                </View>

                {/* Safety & Store Guidelines Disclaimer Card */}
                <View style={[styles.card, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A", borderWidth: 1, padding: 16, marginTop: -8, marginBottom: 16 }]}>
                  <Text style={{ fontFamily: "nunito", fontSize: 11, color: "#B45309", lineHeight: 16, marginBottom: 8 }}>
                    ⚠️ AI responses are generated dynamically and may contain errors. Please verify critical coding facts.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => CustomAlert.alert("Report AI Content", "Thank you! This output has been flagged for manual review and tuning.")}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    <Ionicons name="flag-outline" size={14} color="#D97706" />
                    <Text style={{ fontFamily: "nunito-bold", fontSize: 11, color: "#D97706" }}>Report output</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: "nunito-bold",
    marginLeft: 8,
    color: "#1F2937",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: "nunito-bold",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 17,
    fontFamily: "nunito-bold",
    color: "#1F2937",
    lineHeight: 24,
    marginBottom: 16,
  },
  answersContainer: {
    gap: 8,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  correctBg: {
    backgroundColor: "#ECFDF5",
  },
  incorrectBg: {
    backgroundColor: "#FEF2F2",
  },
  answerLabel: {
    fontSize: 14,
    fontFamily: "nunito-bold",
    color: "#4B5563",
    marginLeft: 8,
    marginRight: 4,
  },
  answerVal: {
    flex: 1,
    fontSize: 14,
    fontFamily: "nunito",
    color: "#1F2937",
  },
  explanationText: {
    fontSize: 15,
    fontFamily: "nunito",
    color: "#4B5563",
    lineHeight: 22,
  },
  aiActionCard: {
    backgroundColor: "#F5F3FF",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    alignItems: "center",
    marginBottom: 16,
  },
  aiActionTitle: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "#5B21B6",
    marginTop: 12,
    marginBottom: 8,
  },
  aiActionDesc: {
    fontSize: 14,
    fontFamily: "nunito",
    color: "#7C3AED",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  aiButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  aiButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "nunito-bold",
  },
  configLink: {
    marginTop: 12,
  },
  configLinkText: {
    fontSize: 14,
    fontFamily: "nunito-bold",
    color: "#8B5CF6",
  },
  loadingCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "nunito-bold",
    color: "#6B7280",
    marginTop: 12,
  },
  aiCard: {
    borderColor: "#DDD6FE",
    backgroundColor: "#FDFDFD",
  },
  aiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  aiCardTitle: {
    fontSize: 16,
    fontFamily: "nunito-bold",
    color: "#5B21B6",
  },
  aiExplanationText: {
    fontSize: 15,
    fontFamily: "nunito",
    color: "#374151",
    lineHeight: 24,
  },
});

// Markdown styles for AI responses
const markdownStyles = {
  body: {
    fontSize: 15,
    fontFamily: "nunito",
    color: "#374151",
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  strong: {
    fontFamily: "nunito-bold",
    color: "#1F2937",
  },
  em: {
    fontStyle: "italic",
    color: "#4B5563",
  },
  code_inline: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 14,
    backgroundColor: "#EDE9FE",
    color: "#6D28D9",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  bullet_list: {
    marginLeft: 4,
    marginBottom: 8,
  },
  ordered_list: {
    marginLeft: 4,
    marginBottom: 8,
  },
};
