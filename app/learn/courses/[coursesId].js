import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import Markdown from "react-native-markdown-display";
import PageTransition from "../../../components/PageTransition";
import SafeScreen from "../../../components/SafeScreen";
import colors from "../../../constants/colors";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../context/context";
import { NativeAdComponent } from "../../../services/AdManager";

// --- Animated Module Item Component ---
const AnimatedModuleItem = ({ item, index, isCompleted, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 100,
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
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100"
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            isCompleted ? "bg-green-100" : "bg-blue-50"
          }`}
        >
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "play-circle"}
            size={28}
            color={isCompleted ? "#10B981" : colors.PRIMARY}
          />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-nunito-bold text-gray-800">
            {item.title}
          </Text>
          <Text className="text-sm font-nunito text-gray-500">
            {isCompleted ? "Completed" : "Start learning"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CourseModules() {
  const { coursesId } = useLocalSearchParams();
  const router = useRouter();
  const { allCourses, setSelectedCourse, setSelectedModule } =
    useContext(allCoursesContext);
  const { userData, updateCourse } = useContext(userDetailsContext);
  const { setClickCount } = useContext(adConfigContext);

  const course = useMemo(() => {
    const isInvalidId = !coursesId || coursesId === "undefined";
    if (!isInvalidId) {
      const found = allCourses.find((c) => c.id === coursesId);
      if (found) return found;
    }
    // Fallback: first course if loaded
    if (allCourses.length > 0) {
      return allCourses[0];
    }
    return null;
  }, [allCourses, coursesId]);

  const progress = userData?.progress?.[course?.title] || {};
  const attemptedQuizzes = progress?.attemptedQuizzes || [];

  const isModuleCompleted = (moduleId) => {
    const quizId = `quiz_${moduleId}`;
    const attempt = attemptedQuizzes.find((q) => q.id === quizId);
    return attempt && attempt.score >= 60;
  };

  useEffect(() => {
    if (!course?.title) return;
    if (userData?.progress?.[course.title]) return;

    updateCourse(course.title, {});
  }, [course, updateCourse, userData]);

  const handleModulePress = (module) => {
    setSelectedCourse(course);
    setSelectedModule(module);
    setClickCount((prev) => prev + 1);
    router.push(`/learn/courses/modules/${module.id}`);
  };

  if (!course) {
    if (allCourses.length > 0) {
      return (
        <SafeScreen>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.ERROR} />
            <Text style={{ fontSize: 22, fontFamily: "nunito-bold", color: "#1F2937", marginTop: 16, marginBottom: 8, textAlign: "center" }}>Course Not Found</Text>
            <Text style={{ fontSize: 15, fontFamily: "nunito", color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 22 }}>
              {"We couldn't resolve the requested course curriculum."}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/learn")}
              style={{ backgroundColor: colors.PRIMARY, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
            >
              <Text style={{ color: "white", fontSize: 16, fontFamily: "nunito-bold" }}>Back to Courses</Text>
            </TouchableOpacity>
          </View>
        </SafeScreen>
      );
    }
    return (
      <SafeScreen>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
      </SafeScreen>
    );
  }

  return (
    <PageTransition>
      <SafeScreen>
        <View className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center mb-6 mt-2">
            <Pressable
              onPress={() => router.back()}
              hitSlop={15}
              className="p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
            <View className="flex-1 ml-2">
              <Text className="text-2xl font-nunito-bold text-gray-900">
                {course.title}
              </Text>
              <Text className="text-sm font-nunito text-gray-500">
                {course.modules?.length || 0} Modules available
              </Text>
            </View>
          </View>

          {/* Conditional Rendering: AI Roadmap vs Standard Course */}
          {course.id?.toString().startsWith("AI_ROADMAP_") ? (
            <View style={{ flex: 1 }}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                style={{ flex: 1, backgroundColor: "white", borderRadius: 16, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 16 }}
              >
                <Markdown
                  style={{
                    body: { fontSize: 16, fontFamily: "nunito", color: "#374151", lineHeight: 24 },
                    heading1: { fontSize: 24, fontFamily: "nunito-bold", color: "#111827", marginBottom: 12, marginTop: 16 },
                    heading2: { fontSize: 20, fontFamily: "nunito-bold", color: "#1F2937", marginBottom: 10, marginTop: 14 },
                    heading3: { fontSize: 18, fontFamily: "nunito-bold", color: "#374151", marginBottom: 8, marginTop: 12 },
                    paragraph: { marginBottom: 12 },
                    list_item: { marginBottom: 6 },
                    code_block: { backgroundColor: "#F3F4F6", padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: 14 },
                    code_inline: { backgroundColor: "#F3F4F6", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, fontFamily: "monospace", fontSize: 14, color: "#EF4444" },
                    link: { color: "#3B82F6", textDecorationLine: "underline" },
                  }}
                >
                  {course.roadmapText || "Your AI syllabus is missing content. Please try generating it again."}
                </Markdown>
              </ScrollView>
              
              {/* Study Flashcards Button */}
              <TouchableOpacity
                onPress={() => {
                  setClickCount((prev) => prev + 1);
                  setSelectedCourse(course);
                  router.push(`/flashcards/courses/${course.id}`);
                }}
                style={{
                  backgroundColor: "#8B5CF6",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: "white", fontSize: 18, fontFamily: "nunito-bold" }}>
                  Study Flashcards 🧠
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
            data={course.modules}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <>
                <AnimatedModuleItem
                  item={item}
                  index={index}
                  isCompleted={isModuleCompleted(item.id)}
                  onPress={() => handleModulePress(item)}
                />
                {/* Inject Native Ad every 4 modules (index 3, 7, 11...) */}
                {index > 0 && (index + 1) % 4 === 0 && (
                  <View style={{ marginVertical: 8 }}>
                    <NativeAdComponent />
                  </View>
                )}
              </>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Text className="text-gray-400 font-nunito">
                  No modules found for this course.
                </Text>
              </View>
            }
            ListFooterComponent={<NativeAdComponent />}
          />
          )}
        </View>
      </SafeScreen>
    </PageTransition>
  );
}
