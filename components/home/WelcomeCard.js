import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { WELCOME_MESSAGES, Emoji, EmojiText } from "../../constants/constants";

export default function Welcome({ userData }) {
  const randomMessage = useMemo(
    () => WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
    []
  );

  return (
    <View className="bg-white mx-4 p-6 mb-4 rounded-2xl shadow-md border border-gray-200 mt-4">
     <View className="flex flex-row items-center gap-2 mb-1">
        <Text className="text-xl text-black font-nunito-bold">
          Hi, {userData?.profile?.name || "user"}
        </Text>
        <Emoji style={{ fontSize: 20 }}>👋</Emoji>
      </View>
      <EmojiText style={{ fontSize: 16, color: '#4B5563', fontFamily: 'nunito' }}>{randomMessage}</EmojiText>
    </View>
  );
}
