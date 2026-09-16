import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "../../services/storage";
import colors from "../../constants/colors";

export default function DailyChallengeCard() {
  const router = useRouter();
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  useEffect(() => {
    // Check if challenge already completed today
    const checkCompletion = async () => {
      const today = new Date().toISOString().split("T")[0];
      const lastCompleted = await AsyncStorage.getItem("@daily_challenge_completed");
      if (lastCompleted === today) {
        setChallengeCompleted(true);
      }
    };
    checkCompletion();
  }, []);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  };

  const handlePress = () => {
    if (!challengeCompleted) {
      router.push("/challenge");
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className="bg-white mx-4 mb-4 rounded-2xl p-6 shadow-md border border-gray-200"
      >
        <View className="flex-row items-center mb-3">
          <Text style={{ fontSize: 24, marginRight: 8 }}>🎯</Text>
          <Text style={{ fontSize: 18, fontFamily: "nunito-bold", color: colors.PRIMARY }}>
            Daily Challenge
          </Text>
        </View>

        {challengeCompleted ? (
          <View className="flex-row items-center mt-1">
            <Text style={{ fontSize: 20, marginRight: 8 }}>✅</Text>
            <View className="flex-1">
              <Text className="text-sm text-gray-600 font-nunito font-bold">
                Challenge Completed!
              </Text>
              <Text className="text-xs text-gray-500 font-nunito mt-1">
                Check back tomorrow for a new one.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View className="flex-row items-center mb-2">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
                  Today&apos;s Coding Trivia
                </Text>
                <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                  Test your knowledge. Earn XP and secure your streak!
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
              <Text className="text-sm text-orange-500 font-nunito font-bold">🎁 +50 XP</Text>
              <Text className="text-sm text-blue-600 font-nunito font-bold">Start Now &rarr;</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
