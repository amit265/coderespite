import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect } from "react";
import {
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/colors";
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

  const removeFavorite = async (question) => {
    console.log("remove favourite called");

    let updated = [];
    setFavorites((prev) => {
      updated = prev?.filter((item) => item?.question !== question);
      return updated;
    });
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };


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
            },
          ]}
        >
          No Favorites yet
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.WHITE }]}
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>{item?.question}</Text>
        
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-between",
            marginTop: 10,
            alignItems: "center", 
          }}
        >
        
          <View
            style={{
              borderRadius: 10,
              borderWidth: 1,
              padding: 5,
              backgroundColor: colors.BACKGROUND,
            }}
          >
            <Text>{item?.questionType}</Text>
          </View>
          <View style={{display: "flex", flexDirection: "row", gap: 15, alignItems: "center"}}>
           
            <Pressable onPress={() => removeFavorite(item?.question)}>
              <MaterialIcons
                name="delete-forever"
                size={30}
                color={colors.ERROR}
              />
            </Pressable>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    // <FlatList
    //   data={favorites}
    //   renderItem={renderItem}
    //   keyExtractor={(item, index) => `${item}-${index}`}
    // />
    <FlashCardItem flashcards={favorites}/>
  );
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
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
});
