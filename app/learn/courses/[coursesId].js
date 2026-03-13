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
} from "react-native";
import PageTransition from "../../../components/PageTransition";
import SafeScreen from "../../../components/SafeScreen";
import colors from "../../../constants/colors";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../context/context";
import { BannerAdComponent } from "../../../services/AdManager";

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
  const { userData } = useContext(userDetailsContext);
  const { setClickCount } = useContext(adConfigContext);

  const course = useMemo(() => {
    return allCourses.find((c) => c.id === coursesId);
  }, [allCourses, coursesId]);

  const progress = userData?.progress?.[course?.title] || {};
  const attemptedQuizzes = progress?.attemptedQuizzes || [];

  const isModuleCompleted = (moduleId) => {
    const quizId = `quiz_${moduleId}`;
    const attempt = attemptedQuizzes.find((q) => q.id === quizId);
    return attempt && attempt.score >= 60;
  };

  const handleModulePress = (module) => {
    setSelectedCourse(course);
    setSelectedModule(module);
    setClickCount((prev) => prev + 1);
    router.push(`/learn/courses/modules/${module.id}`);
  };

  if (!course) {
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

          {/* Module List */}
          <FlatList
            data={course.modules}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <AnimatedModuleItem
                item={item}
                index={index}
                isCompleted={isModuleCompleted(item.id)}
                onPress={() => handleModulePress(item)}
              />
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
          />
        </View>

        {/* Bottom Banner Ad */}
        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}
