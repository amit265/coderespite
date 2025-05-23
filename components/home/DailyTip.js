import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import dailyTip from "../../assets/data/dailyTip.json";
import { shuffle } from "../../services/shuffleArray";

export default function DailyTip() {
  const [randomTip, setRandomTip] = useState("");

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]; // e.g., "2025-05-18"

    const getTip = async () => {
      try {
        const tipKey = "@" + todayStr;
        const storedValue = await AsyncStorage.getItem(tipKey);

        if (storedValue) {
          const parsedTip = JSON.parse(storedValue);
          setRandomTip(parsedTip);
        } else {
          const tip = shuffle(dailyTip)[0];
          setRandomTip(tip?.tip);
          await AsyncStorage.setItem(tipKey, JSON.stringify(tip?.tip));
        }
      } catch (error) {
        console.error("Failed to get/store daily tip:", error);
      }
    };

    getTip();
  }, []);

  return (
    <View className="bg-white p-4 rounded-xl shadow-md mx-4 my-2">
      <Text className="text-xl font-nunito-bold text-gray-800 mb-2">
        💡 Tip of The Day
      </Text>
      <Text className="text-base text-gray-600">“{randomTip}”</Text>
    </View>
  );
}
