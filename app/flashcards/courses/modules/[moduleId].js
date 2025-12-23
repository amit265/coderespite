import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Pressable, Text, View, Animated } from "react-native";
import FlashCardItem from "../../../../components/FlashCardItem";
import SafeScreen from "../../../../components/SafeScreen";
import colors from "../../../../constants/colors";
import { allCoursesContext } from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";
import PageTransition from "../../../../components/PageTransition";

// --- Helper for Content Entrance ---
const FadeInView = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1, // Ensure it takes up space
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function ModuleId() {
  const { moduleId, courseId } = useLocalSearchParams();
  const [selectedModule, setSelectedModule] = useState(null);
  const { allCourses } = useContext(allCoursesContext);
  const router = useRouter();

  const courseTitle = allCourses.find(
    (course) => course?.id === courseId
  )?.title;

  useEffect(() => {
    const moduleFound = allCourses
      .find((course) => course?.id === courseId)
      ?.flashcards.find((item) => item.id === moduleId);
    setSelectedModule(moduleFound);
  }, [moduleId, courseId, allCourses]);

  if (!selectedModule) {
    return (
      <SafeScreen>
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-600 text-lg font-nunito">
            Flashcard module not found.
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <PageTransition>
      <SafeScreen>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-2 mb-2">
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="arrow-back" size={30} color="black" />
            </Pressable>

            <View className="flex-1 mx-4 items-center">
              <Text
                className="text-black font-nunito-bold text-xl text-center"
                numberOfLines={1}
              >
                {selectedModule?.title}
              </Text>
            </View>

            <Pressable onPress={() => router.push("/flashcards/favoritesFc")} hitSlop={10}>
              <Ionicons name="heart" size={30} color="red" />
            </Pressable>
          </View>

          {/* Flashcard Player Area - Animated Entrance */}
          <FadeInView delay={100}>
            <FlashCardItem
              flashcards={selectedModule?.flashcards}
              title={selectedModule?.title}
              courseTitle={courseTitle}
            />
          </FadeInView>
        </View>

        {/* Bottom Banner Ad */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 4,
            backgroundColor: colors.BACKGROUND,
          }}
        >
          <BannerAdComponent />
        </View>
      </SafeScreen>
    </PageTransition>
  );
}