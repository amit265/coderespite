import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { favoritesContext } from "../context/context";
import FlashCardItem from "./FlashCardItem";

export default function Favorites() {
  const { favorites, setFavorites } = useContext(favoritesContext);
  //   console.log("favorites from favorites", favorites);

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem("favorites");
      setFavorites(JSON.parse(data));
    };
    loadData();
  }, []);

  //   console.log("favorites from facourite", favorites);

  if (favorites?.length === 0) {
    return (
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={[
            styles.buttonText,
            {
              fontSize: 25,
              position: "absolute",
              top: 200,
              alignSelf: "center",
              fontFamily: "nunito",
            },
          ]}
        >
          No Favorites yet
        </Text>
      </View>
    );
  }

  return <FlashCardItem flashcards={favorites} />;
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    marginTop: 15,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    margin: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "nunito",
    textAlign: "left",
  },
});
