import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { favoritesContext } from "../context/context";
import FlashCardItem from "./FlashCardItem";
import Button from "./shared/Button";

export default function Favorites() {
  const { favorites, setFavorites } = useContext(favoritesContext);
  console.log("favorites from favorites", favorites);
  const router = useRouter();
  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem("@favoriteFlashcard_data");
      setFavorites(JSON.parse(data));
    };
    loadData();
  }, []);

  //   console.log("favorites from facourite", favorites);

  if (!favorites || favorites?.length === 0) {
    return (
      <View className="flex justify-center items-center h-2/3">
        <View>
          <Text className="font-2xl text-center mt-24">
            No favorite FlashCards yet
          </Text>
          <View className="px-12">
            <Button
              text={"Go to FlashCards"}
              onPress={() => router.push("/(tabs)/flashcards")}
            />
          </View>
        </View>
      </View>
    );
  }

  return <FlashCardItem flashcards={favorites} />;
}
