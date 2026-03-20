import LottieView from "lottie-react-native";
import React, { useEffect, useState, useRef } from "react";
import { Modal, Text, View, Animated, Easing } from "react-native";
import { levels, Emoji, EmojiText } from "../constants/constants";
import ProgressBar from "./home/ProgressBar";
import Button from "./shared/Button";
import colors from "../constants/colors";

// --- Helper Component for Staggered Text Entrance ---
const StaggeredView = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

export default function LevelUpModal({ visible, onClose, currentLevel }) {
  const [levelData, setLevelData] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Animation Refs for main modal entrance and badge pulse
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const badgePulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const newLevel =
      levels.find((lvl) => lvl.id === currentLevel) ||
      levels[levels.length - 1];
    const upcomingLevel =
      levels.find((lvl) => lvl.id === currentLevel + 1) || null;

    setLevelData(newLevel);
    setNextLevel(upcomingLevel);
    
    if (visible) {
      setShowConfetti(true);
      // 1. Reset animations
      modalScaleAnim.setValue(0.8);
      badgePulseAnim.setValue(1);

      // 2. Start Modal Bouncy Entrance
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // 3. Trigger Badge Pulse after a short delay
      setTimeout(() => {
         Animated.sequence([
            Animated.timing(badgePulseAnim, { toValue: 1.1, duration: 150, useNativeDriver: true, easing: Easing.ease }),
            Animated.spring(badgePulseAnim, { toValue: 1, friction: 4, useNativeDriver: true })
         ]).start();
      }, 400);
    }

  }, [currentLevel, visible]);

  if (!levelData || !visible) return null;

  return (
    <Modal
      transparent
      animationType="fade" // Changed from "slide" to "fade" for custom entrance
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }} // Slightly darker background for pop
      >
        {/* Confetti z-index lowered slightly so it doesn't block interaction if animation gets stuck */}
        {showConfetti && (
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center z-10" pointerEvents="none">
            <LottieView
              source={require("../assets/fun.json")}
              autoPlay
              loop={false}
              onAnimationFinish={() => setShowConfetti(false)}
              style={{ width: "100%", height: "100%" }} // Ensure it covers screen
              resizeMode="cover"
            />
          </View>
        )}

        {/* Main White Box with Pop-in Animation */}
        <Animated.View 
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl items-center z-20"
            style={{ transform: [{ scale: modalScaleAnim }] }}
        >
          {/* Staggered Content */}
          <StaggeredView delay={100}>
             <EmojiText className="text-3xl font-bold text-green-600 mb-2 text-center">
               🎉 Congrats!
             </EmojiText>
          </StaggeredView>

          <StaggeredView delay={200}>
             <Text className="text-base text-gray-700 text-center mb-5">
               You&apos;ve leveled up and are growing stronger every day!
             </Text>
          </StaggeredView>

          {/* The Main Badge with extra Pulse animation */}
          <Animated.View style={{ transform: [{ scale: badgePulseAnim }] }}>
             <View className="flex flex-row items-center gap-2 mb-4 bg-blue-50 px-4 py-2 rounded-full">
               <Text className="text-xl font-bold text-gray-800">
                 Level {levelData.id}:
               </Text>
               <Text className="text-xl font-bold text-blue-600">
                 {levelData.title || "Unknown"}
               </Text>
             </View>
          </Animated.View>

          <StaggeredView delay={400}>
             <Text className="text-sm text-gray-600 mb-6 text-center leading-relaxed px-4">
               "{levelData.description || "You're making great progress. Keep going!"}"
             </Text>
          </StaggeredView>

          <StaggeredView delay={500}>
             <View className="w-full mb-6">
               <ProgressBar />
               <EmojiText className="italic text-center text-gray-500 text-xs mt-2">
                 🌟 Keep going! Each step sharpens your mind.
               </EmojiText>
             </View>
          </StaggeredView>

          <StaggeredView delay={600}>
             {nextLevel ? (
               <View className="w-full mb-6 items-center">
                 <Text className="text-xs text-gray-500 uppercase tracking-widest mb-1">Next Target</Text>
                 <Text className="font-semibold text-gray-800">
                   Level {nextLevel.id} - {nextLevel.title}
                 </Text>
               </View>
             ) : (
               <View className="w-full mb-6 items-center">
                 <EmojiText className="text-sm text-gray-600 italic">
                   🏁 You&apos;ve reached the final level!
                 </EmojiText>
               </View>
             )}
          </StaggeredView>

          <StaggeredView delay={700} style={{ width: '100%' }}>
             <Button text={"Continue"} backgroundColor={colors.PRIMARY || "green"} onPress={onClose} />
          </StaggeredView>
        </Animated.View>
      </View>
    </Modal>
  );
}
