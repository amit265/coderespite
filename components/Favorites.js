import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Text, View } from "react-native";
import { adConfigContext, favoritesContext } from "../context/context";
import FlashCardItem from "./FlashCardItem";
import Button from "./shared/Button";

export default function Favorites() {
  const { favorites, setFavorites } = useContext(favoritesContext);
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem("favorites"); // ✅ consistent key
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          } else {
            console.warn("Parsed favorites is not an array:", parsed);
          }
        } else {
          console.log("No favorites found in storage.");
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };

    loadData();
  }, []);

  if (!favorites || favorites.length === 0) {
    return (
      <View className="flex justify-center items-center h-2/3">
        <Text className="text-2xl text-center mt-24">
          No favorite FlashCards yet
        </Text>
        <View className="px-12">
          <Button
            text="Go to FlashCards"
            onPress={() => {
              setClickCount((prev) => prev + 1);
              router.push("/(tabs)/flashcards");
            }}
          />
        </View>
      </View>
    );
  }

  return <FlashCardItem flashcards={favorites} favorite={"favorite"} />;
}
