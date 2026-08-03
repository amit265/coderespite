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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { generateRoadmapWithGroq, getGroqApiKey } from "../../services/groqService";
import { useGlobalRefresh } from "../../hooks/useGlobalRefresh";

export default function AIRoadmap() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshData } = useGlobalRefresh();

  const handleGenerate = async () => {
    const cleanGoal = goal.trim();
    if (!cleanGoal) {
      Alert.alert("Goal Required", "Please enter what you want to learn.");
      return;
    }

    setLoading(true);
    try {
      const activeKey = await getGroqApiKey();
      const generatedCourse = await generateRoadmapWithGroq(cleanGoal, activeKey);

      if (generatedCourse && generatedCourse.id) {
        // Load existing custom courses
        const storedCustom = await AsyncStorage.getItem("@custom_ai_courses");
        const customCourses = storedCustom ? JSON.parse(storedCustom) : [];
        
        // Append the new bespoke course
        const updatedCustom = [...customCourses, generatedCourse];
        await AsyncStorage.setItem("@custom_ai_courses", JSON.stringify(updatedCustom));

        // Initialize progress for this dynamic course
        const storedUser = await AsyncStorage.getItem("@user_data");
        const userData = storedUser ? JSON.parse(storedUser) : {};
        if (!userData.progress) userData.progress = {};
        userData.progress[generatedCourse.title] = {
          attemptedQuizzes: [],
          flashcardsViewed: [],
          flashcardsLoved: [],
          completed: false,
          percentage: 0,
        };
        await AsyncStorage.setItem("@user_data", JSON.stringify(userData));

        // Trigger local cache reload to refresh allCourses Context
        await refreshData(false);

        // Redirect straight to the course modules overview list
        router.push(`/learn/courses/${generatedCourse.id}`);
      } else {
        throw new Error("Invalid roadmap structure generated");
      }
    } catch (error) {
      Alert.alert(
        "Roadmap Generation Issue",
        "We encountered an issue generating your custom roadmap. Please verify or update your key in the AI Configuration Guide under Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: () => router.push("/settings") },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (suggestedGoal) => {
    setGoal(suggestedGoal);
  };

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={15}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
            <Text style={styles.headerTitle}>⚡️ AI Custom Roadmap</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 What do you want to learn?</Text>
              <Text style={styles.cardDesc}>
                {"Enter any programming topic, stack, or goal (e.g. \"Next.js routing\", \"SQL Database Design\", \"Advanced Git merges\"). Our AI will build a personalized syllabus of flashcards and quizzes instantly!"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="I want to learn..."
                placeholderTextColor="#9CA3AF"
                value={goal}
                onChangeText={setGoal}
                multiline={true}
                numberOfLines={3}
              />

              <Text style={styles.subTitle}>Suggestions:</Text>
              <View style={styles.chipRow}>
                {[
                  "SQL Joins & Indexes",
                  "TypeScript Generics",
                  "Docker Containers",
                  "REST API Design",
                  "Python Data Structures",
                ].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, goal.toLowerCase() === item.toLowerCase() && styles.activeChip]}
                    onPress={() => handleQuickSelect(item)}
                  >
                    <Text style={[styles.chipText, goal.toLowerCase() === item.toLowerCase() && styles.activeChipText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Meowgrammer is building your syllabus... 🐾</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
                <Text style={styles.generateBtnText}>Generate My Roadmap 🚀</Text>
              </TouchableOpacity>
            )}

            <View style={[styles.card, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A", borderWidth: 1, marginTop: 24, padding: 16 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Ionicons name="warning" size={20} color="#D97706" />
                <Text style={{ fontFamily: "quicksand-bold", fontSize: 14, color: "#92400E" }}>
                  AI Generation safety disclaimer
                </Text>
              </View>
              <Text style={{ fontFamily: "nunito", fontSize: 12, color: "#B45309", lineHeight: 18 }}>
                {"Syllabi are generated dynamically by artificial intelligence. Results may contain errors or hallucinations. By generating content, you agree not to submit offensive or harmful prompts."}
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
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
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
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "black",
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "nunito",
    textAlignVertical: "top",
    minHeight: 80,
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
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  generateBtnText: {
    color: "white",
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
