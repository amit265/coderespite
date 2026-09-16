import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { WELCOME_MESSAGES, Emoji, EmojiText } from "../../constants/constants";

export default function Welcome({ userData }) {
  const randomMessage = useMemo(
    () => WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
    []
  );

  const currentStreak = userData?.streak?.currentStreak || 0;
  const freezes = userData?.streak?.freezes || 0;

  return (
    <View className="bg-white mx-4 p-6 mb-4 rounded-2xl shadow-md border border-gray-200 mt-4">
      <View className="flex flex-row justify-between items-start mb-2">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-xl text-black font-nunito-bold flex-shrink" numberOfLines={1} style={{ maxWidth: '70%' }}>
            Hi, {userData?.profile?.name || "user"}
          </Text>
          <Emoji style={{ fontSize: 20 }}>👋</Emoji>
        </View>
        
        <View className="flex flex-row items-center bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          <Emoji style={{ fontSize: 16, marginRight: 4 }}>🔥</Emoji>
          <Text className="text-orange-600 font-nunito-bold">{currentStreak}</Text>
          {freezes > 0 && (
            <View className="flex flex-row items-center ml-2 border-l border-orange-200 pl-2">
              <Emoji style={{ fontSize: 14, marginRight: 2 }}>❄️</Emoji>
              <Text className="text-blue-500 font-nunito-bold text-xs">{freezes}</Text>
            </View>
          )}
        </View>
      </View>
      <EmojiText style={{ fontSize: 16, color: '#4B5563', fontFamily: 'nunito' }}>{randomMessage}</EmojiText>
    </View>
  );
}
