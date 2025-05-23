import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { WELCOME_MESSAGES } from "../../constants/constants";

export default function Welcome({ userData }) {
  const randomMessage = useMemo(
    () => WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
    []
  );

  return (
    <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-md border border-gray-200">
      <View className="flex gap-2">
        <Text className="text-lg text-gray-800">
          Hi, {userData?.profile?.name} 👋
        </Text>
        <Text className="text-base text-gray-600">{randomMessage}</Text>
      </View>
    </View>
  );
}
