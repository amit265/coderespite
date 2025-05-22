import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { getAvatarImage, levels } from "../constants/constants";

export default function UserCard({ userDetails, setShowModal }) {
  console.log("userdetails", userDetails);
  const profile = userDetails?.profile;
  const level = levels[profile.level - 1].title;
  return (
    <View className="flex flex-row gap-10 mt-4 p-4 bg-white rounded-xl">
      <View>
        <Image
          source={getAvatarImage(profile?.avatar)}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 12,
          }}
        ></Image>
      </View>
      <View className="flex justify-center">
        <View className="flex flex-col items-start">
          <Text className="text-base font-bold">Username: </Text>
          <Text className="text-base">{profile.name}</Text>
        </View>
        <View className="flex flex-col items-start flex-wrap">
          <Text className="text-base font-bold">Level: </Text>
          <Text className="text-base flex-wrap">{level}</Text>
        </View>
      </View>
      <Pressable
        style={{ position: "absolute", right: 0, top: 0, padding: 16 }}
        onPress={() => setShowModal(true)}
      >
        <Feather name="edit-3" size={24} color="black" />
      </Pressable>
    </View>
  );
}
