import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { WELCOME_MESSAGES, Emoji } from "../../constants/constants";

export default function Welcome({ userData }) {
  const randomMessage = useMemo(
    () => WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
    []
  );

  return (
    <View className="bg-white mx-4 p-6 mb-4 rounded-2xl shadow-md border border-gray-200 mt-4">
     <View className="flex gap-2">
        <Text className="text-xl text-black font-nunito-bold">
          Hi, {userData?.profile?.name || "user"} <Emoji>👋</Emoji>
        </Text>
        <Emoji style={{ fontSize: 16, color: '#4B5563', fontFamily: 'nunito' }}>{randomMessage}</Emoji>
      </View>
    </View>
  );
}
