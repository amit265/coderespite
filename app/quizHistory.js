import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import QuizHistoryCard from "../components/QuizHistoryCard";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import colors from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";

export default function QuizHistory() {
  const router = useRouter();
  const [quizData, setQuizData] = useState([]);

  useEffect(() => {
    loadAttemptedQuizzes();
  }, []);

  const loadAttemptedQuizzes = async () => {
    try {
      const stored = await AsyncStorage.getItem("@attemptedQuiz_data");
      setQuizData(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.error("Failed to load quiz history:", err);
    }
  };

  return (
    <SafeScreen>
      <View className="relative w-full items-center justify-center pb-4">
        {/* Back Arrow - Positioned on the left */}
        <Pressable
          onPress={() => router.back()}
          className="absolute justify-center items-center left-4"
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>

        {/* Title - Centered */}
        <Text 
          style={{
            fontSize: 20,
            fontFamily: "nunito-bold",
            color: colors.TEXT,
            textAlign: "center",
          }}
        >
          Quiz History
        </Text>
      </View>
      <View className="flex justify-center items-center h-2/3">
        {quizData?.length !== 0 ? (
          <QuizHistoryCard quizData={quizData} />
        ) : (
          <View>
            <Text className="font-2xl text-center mt-24">
              No attempted quiz yet
            </Text>
            <View className="px-12">
              <Button
                text={"Go to Quiz"}
                onPress={() => router.push("/(tabs)/quiz")}
              />
            </View>
          </View>
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
          backgroundColor: colors.BACKGROUND, // Optional: to avoid transparency glitches
        }}
      >
        <BannerAdComponent />
      </View>
    </SafeScreen>
  );
}
