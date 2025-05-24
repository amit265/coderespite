import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { getAvatarImage, levels } from "../constants/constants";
import ProgressBar from "./home/ProgressBar";

export default function UserCard({ userData, setShowModal }) {
  console.log("userdetails frlmo user card", userData);
  const profile = userData?.profile;
  const level =
    levels[userData?.level?.currentLevel - 1]?.title || "Curious Kitten";

  return (
    <View className="mt-4 p-4 bg-white rounded-xl">
      <View className="flex flex-row gap-10 bg-white rounded-xl">
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
            <Text className="text-base" style={{ fontFamily: "nunito-bold" }}>
              Username:{" "}
            </Text>
            <Text className="text-base" style={{ fontFamily: "nunito" }}>
              {profile?.name || "user"}
            </Text>
          </View>
          <View className="flex flex-col items-start flex-wrap">
            <Text
              className="text-base font-nunito-bold"
              style={{ fontFamily: "nunito-bold" }}
            >
              Level:{" "}
            </Text>
            <Text
              className="text-base flex-wrap font-nunito"
              style={{ fontFamily: "nunito" }}
            >
              {level}
            </Text>
          </View>
        </View>

        <Pressable
          style={{ position: "absolute", right: 0, top: 0, padding: 16 }}
          onPress={() => setShowModal(true)}
        >
          <Feather name="edit-3" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
}
