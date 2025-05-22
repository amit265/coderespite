import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import FlipCard from "react-native-flip-card";
import colors from "../constants/colors";
import { favoritesContext } from "../context/context";

export default function FlashCardItem({ flashcards, title }) {
  const screenWidth = Dimensions.get("screen").width;
  const { favorites, setFavorites } = useContext(favoritesContext);

  const isFavorite = (question) => {
    return favorites?.some((item) => item?.question === question);
  };
  console.log("flashcards from flashcardcomponentfhgffhg", favorites);

  const addFavorite = async (question, title, answer) => {
    // console.log("question", question);

    setFavorites((prev) => {
      const exists = prev?.some((item) => item?.question === question);

      if (exists) {
        console.log("exsts", exists);

        return prev;
      }

      const updateFavorites = [...prev, { question, title, answer }];
      AsyncStorage.setItem("favorites", JSON.stringify(updateFavorites));

      return updateFavorites;
    });
  };

  return (
    <View style={{ marginBottom: 50 }}>
      <FlatList
        data={flashcards}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }, index) => {
          const currentQuestion = item.question;

          const favorite = isFavorite(currentQuestion);

          return (
            <View className="mt-12 mx-auto">
              <FlipCard
                style={{
                  width: screenWidth * 0.78,
                  height: 200,
                  borderRadius: 20,
                  marginHorizontal: screenWidth * 0.05,
                }}
                friction={12} // Increase for slower, smoother flip
                perspective={1500} // More realistic 3D effect
                flipVertical
                clickable
              >
                {/* Front Side */}
                <View className="bg-white flex-1 rounded-2xl justify-center items-center px-14">
                  <View className="absolute bottom-2 p-4 z-50">
                    {favorite ? (
                      <Pressable
                        onPress={() => {
                          requestAnimationFrame(() => {
                            const updated = favorites.filter(
                              (item) => item.question !== currentQuestion
                            );
                            setFavorites(updated);
                            AsyncStorage.setItem(
                              "favorites",
                              JSON.stringify(updated)
                            );
                          });
                        }}
                      >
                        <Ionicons name="heart" size={30} color={colors.ERROR} />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => {
                          requestAnimationFrame(() => {
                            addFavorite(item?.question, title, item?.answer);
                          });
                        }}
                      >
                        <Ionicons
                          name="heart-outline"
                          size={30}
                          color={colors.PRIMARY}
                        />
                      </Pressable>
                    )}
                  </View>
                  {item?.title && (
                    <View className="absolute border border-gray-300 top-2 p-2 rounded-lg ">
                      <Text className="text-center font-nunito-semibold">{item?.title}</Text>
                    </View>
                  )}
                  <View>
                    <Text className="text-lg font-nunito-bold text-center text-gray-800">
                      {item?.question}
                    </Text>
                  </View>
                </View>

                {/* Back Side */}
                <View
                  className="flex-1 rounded-2xl justify-center items-center px-4"
                  style={{ backgroundColor: colors.PRIMARY }}
                >
                  <Text className="text-white text-xl text-center font-nunito-bold py-2">
                    {item?.answer}
                  </Text>
                </View>
              </FlipCard>
            </View>
          );
        }}
      />
    </View>
  );
}
