import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef } from "react";
import { Pressable, Text, View, Animated } from "react-native";
import ContentPage from "../../../../components/ContentPage";
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
        duration: 800, // Slower duration for a relaxed reading vibe
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9, // High friction = less bounce, more smooth slide
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1, // Critical: ensures the content takes up remaining space
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function Lesson() {
  const { selectedLesson, selectedQuiz } = useContext(allCoursesContext);
  const router = useRouter();

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header */}
        <View
          className="flex flex-row w-full justify-start px-2 mb-4"
          style={{ gap: 8 }}
        >
          {/* Back Arrow */}
          <Pressable
            onPress={() => router.back()}
            className="justify-center items-center"
            hitSlop={10} // Makes it easier to tap
          >
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>

          {/* Title */}
          <Text
            style={{
              fontFamily: "nunito-bold",
              color: colors.TEXT,
              textAlign: "left",
              flex: 1,
              fontSize: 20,
            }}
            className="text-lg"
            numberOfLines={1}
          >
            {selectedLesson?.title || "Lesson Title"}
          </Text>
        </View>

        {/* Content Page - Animated Wrapper */}
        <FadeInView delay={100}>
          <ContentPage selectedLesson={selectedLesson} />
        </FadeInView>

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