import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Pressable, Text, View, Animated } from "react-native";
import { Emoji } from "../../constants/constants";

const actions = [
  { icon: "📘", label: "Learn", bg: "bg-blue-100", tab: "learn" },
  { icon: "📇", label: "Flashcards", bg: "bg-yellow-100", tab: "flashcards" },
  { icon: "📝", label: "Quiz", bg: "bg-green-100", tab: "quiz" },
  { icon: "👤", label: "Profile", bg: "bg-purple-100", tab: "profile" },
];

// --- Individual Animated Button ---
const ActionButton = ({ action, index, onPress }) => {
  // 1. Entrance Animation (Scale from 0 to 1)
  const popAnim = useRef(new Animated.Value(0)).current;
  
  // 2. Press Animation (Scale from 1 to 0.9)
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // The "Pop" entrance
    Animated.spring(popAnim, {
      toValue: 1,
      friction: 5, // Bouncy
      tension: 40,
      delay: index * 100, // Staggered delay (100ms, 200ms, etc.)
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        width: "48%", // Maintain layout
        transform: [{ scale: popAnim }], // Apply entrance pop
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          className={`h-28 mb-4 ${action.bg} rounded-xl p-4`}
          style={{
            // Apply press shrink/grow
            transform: [{ scale: pressAnim }],
            // Add shadow manually for better animation performance
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Emoji style={{ fontSize: 30, marginBottom: 8 }}>{action.icon}</Emoji>
          <Text className="text-base font-nunito text-gray-600 font-bold">
            {action.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function QuickActionGrid() {
  const router = useRouter();

  const handlePress = (tab) => {
    // Small delay to allow the bounce animation to play before switching screens
    setTimeout(() => {
      router.push(`(tabs)/${tab}`);
    }, 150);
  };

  return (
    <View className="bg-white p-6 rounded-xl shadow-md mx-4 mb-4">
      <View className="flex-row items-center mb-4 gap-2">
        <EmojiText className="text-xl font-nunito-bold">🔀 Quick Actions</EmojiText>
      </View>
      
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            index={index}
            action={action}
            onPress={() => handlePress(action.tab)}
          />
        ))}
      </View>
    </View>
  );
}
