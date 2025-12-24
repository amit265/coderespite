import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { Pressable, Text, View, Animated } from "react-native";
import QuizHistoryCard from "../components/QuizHistoryCard";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import colors from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";
import PageTransition from "../components/PageTransition";

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
        flex: 1, // Takes up available space
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        width: "100%",
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function QuizHistory() {
  const router = useRouter();
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttemptedQuizzes();
  }, []);

  const loadAttemptedQuizzes = async () => {
    try {
      const stored = await AsyncStorage.getItem("@attemptedQuiz_data");
      // Sort by date (newest first) if data exists
      let parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        parsed = parsed.reverse(); // Assuming you want newest at top
      }
      setQuizData(parsed);
    } catch (err) {
      console.error("Failed to load quiz history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header */}
        <View
          className="flex flex-row w-full justify-start items-center px-4 mb-4"
          style={{ gap: 10 }}
        >
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontFamily: "nunito-bold",
              color: colors.TEXT,
              flex: 1,
            }}
          >
            Quiz History
          </Text>
        </View>

        {/* Content Area */}
        <View style={{ flex: 1 }}>
          {!loading && quizData?.length > 0 ? (
            <FadeInView delay={100}>
              {/* Note: Ensure your QuizHistoryCard component handles scrolling 
                 (e.g., contains a FlatList or ScrollView). 
                 We add paddingBottom to avoid Ad overlap.
              */}
              <View style={{ flex: 1, paddingBottom: 60 }}>
                <QuizHistoryCard quizData={quizData} />
              </View>
            </FadeInView>
          ) : (
            !loading && (
              <FadeInView delay={100}>
                <View className="flex-1 justify-center items-center px-6">
                  <MaterialCommunityIcons
                    name="history"
                    size={80}
                    color="#E5E7EB" // Light gray
                    style={{ marginBottom: 20 }}
                  />
                  <Text className="text-xl font-nunito-bold text-gray-800 text-center mb-2">
                    No quizzes attempted yet
                  </Text>
                  <Text className="text-base font-nunito text-gray-500 text-center mb-8">
                    Challenge yourself with a quiz to track your progress here!
                  </Text>
                  
                  <View className="w-full">
                    <Button
                      text={"Take a Quiz"}
                      onPress={() => router.push("/(tabs)/quiz")}
                    />
                  </View>
                </View>
              </FadeInView>
            )
          )}
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