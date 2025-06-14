import React, { useEffect, useState } from "react";
import { Modal, Text, View } from "react-native";
import { levels } from "../constants/constants";
import ProgressBar from "./home/ProgressBar";
import Button from "./shared/Button";

export default function LevelUpModal({ visible, onClose, currentLevel }) {
  const [levelData, setLevelData] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const newLevel =
      levels.find((lvl) => lvl.id === currentLevel) ||
      levels[levels.length - 1];
    const upcomingLevel =
      levels.find((lvl) => lvl.id === currentLevel + 1) || null;

    setLevelData(newLevel);
    setNextLevel(upcomingLevel);
    setShowConfetti(true);
  }, [currentLevel]);

  if (!levelData || !visible) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        {/* Confetti */}
        {showConfetti && (
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center z-50">
            <Lottie
              source={require("../assets/fun.json")}
              autoPlay
              loop={false}
              onAnimationFinish={() => setShowConfetti(false)}
              style={{ width: 1000, height: 1000 }}
            />
          </View>
        )}

        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl items-center">
          <Text className="text-3xl font-bold text-green-600 mb-2">
            🎉 Congrats!
          </Text>
          <Text className="text-base text-gray-700 text-center mb-4">
            You've leveled up and are growing stronger every day!
          </Text>

          <View className="flex flex-row items-center gap-2 mb-3">
            <Text className="text-lg font-semibold text-gray-800">
              Level {levelData.id}:
            </Text>
            <Text className="text-lg font-semibold text-blue-600">
              {levelData.title || "Unknown"}
            </Text>
          </View>

          <Text className="text-sm text-gray-600 mb-4 text-center leading-relaxed">
            {levelData.description ||
              "You're making great progress. Keep going!"}
          </Text>

          <Text className="italic text-center text-gray-700 text-sm mb-2">
            🌟 Keep going! Each step sharpens your claws and mind.
          </Text>

          <View className="w-full mt-2 mb-4">
            <ProgressBar />
          </View>

          {nextLevel ? (
            <View className="w-full mt-2 mb-4 items-center">
              <Text className="text-sm text-gray-600">Next Target:</Text>
              <Text className="font-semibold text-gray-800">
                Level {nextLevel.id} - {nextLevel.title}
              </Text>
            </View>
          ) : (
            <View className="w-full mt-2 mb-4 items-center">
              <Text className="text-sm text-gray-600 italic">
                🏁 You've reached the final level!
              </Text>
            </View>
          )}

          <Button text={"Continue"} backgroundColor="green" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
