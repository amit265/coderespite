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
      const storedTip = await AsyncStorage.getItem(`tip-${todayStr}`);

      if (storedTip) {
        setRandomTip(storedTip);
      } else {
        const tip = shuffle(dailyTip)[0];
        setRandomTip(tip);
        await AsyncStorage.setItem(`tip-${todayStr}`, tip);
      }
    };

    getTip();
    logAllAsyncStorage();
  }, []);

  const logAllAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      
      console.log("📦 AsyncStorage contents:");
      result.forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    } catch (error) {
      console.error("Error reading AsyncStorage:", error);
    }
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-md mx-4 my-2">
      <Text className="text-xl font-bold text-gray-800 mb-2">
        💡 Tip of The Day
      </Text>
      <Text className="text-base text-gray-600">“{randomTip}”</Text>
    </View>
  );
}
