import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PageTransition from "../../../../components/PageTransition";
import SafeScreen from "../../../../components/SafeScreen";
import Button from "../../../../components/shared/Button";
import colors from "../../../../constants/colors";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";

const { width } = Dimensions.get("window");

export default function ModuleDetail() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const { allCourses, setSelectedLesson, selectedModule } =
    useContext(allCoursesContext);
  const { userData } = useContext(userDetailsContext);
  const { setClickCount } = useContext(adConfigContext);

  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Find the current module from context or params
  const module = selectedModule;

  useEffect(() => {
    if (module) {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [module]);

  if (loading || !module) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeScreen>
    );
  }

  const handleLessonPress = (lesson) => {
    setSelectedLesson(lesson);
    setClickCount((prev) => prev + 1);
    router.push({
      pathname: "/learn/courses/modules/lesson",
      params: { moduleId },
    });
  };

  const handleQuizPress = () => {
    setClickCount((prev) => prev + 1);
    router.push(`/quiz/courses/quiz_${moduleId}`);
  };

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={15}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {module.title}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Module Description */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.description}>
                  Dive into the core concepts of {module.title}. This module
                  covers essential topics to help you master the subject.
                </Text>
              </View>

              {/* Lessons List */}
              <Text style={styles.sectionHeader}>Lessons</Text>
              {module.lessons?.map((lesson, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLessonPress(lesson)}
                  style={styles.lessonItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonIconContainer}>
                    <Ionicons
                      name="book-outline"
                      size={24}
                      color={colors.PRIMARY}
                    />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonType}>
                      {lesson.type === "theory" ? "Theory" : "Code Snippets"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}

              {/* Quiz Section */}
              <View style={styles.quizSection}>
                <View style={styles.quizCard}>
                  <View style={styles.quizIconBg}>
                    <Ionicons name="help-circle" size={32} color="#8B5CF6" />
                  </View>
                  <View style={styles.quizContent}>
                    <Text style={styles.quizTitle}>Ready for a Quiz?</Text>
                    <Text style={styles.quizSubtitle}>
                      Test your knowledge and earn XP!
                    </Text>
                  </View>
                </View>
                <Button
                  text="Start Quiz"
                  onPress={handleQuizPress}
                  backgroundColor={colors.SECONDARY || "#8B5CF6"}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </View>

        {/* Bottom Banner Ad */}
        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingBottom: 100,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: "nunito",
    color: "#4B5563",
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  lessonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: "nunito-bold",
    color: "#1F2937",
  },
  lessonType: {
    fontSize: 13,
    fontFamily: "nunito",
    color: "#6B7280",
    marginTop: 2,
  },
  quizSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  quizIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "#5B21B6",
  },
  quizSubtitle: {
    fontSize: 14,
    fontFamily: "nunito",
    color: "#7C3AED",
    marginTop: 2,
  },
});
