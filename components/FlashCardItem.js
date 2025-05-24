import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import FlipCard from "react-native-flip-card";
import colors from "../constants/colors";
import { favoritesContext, userDetailsContext } from "../context/context";
export default function FlashCardItem({
  flashcards,
  title,
  courseTitle,
  favorite,
}) {
  const screenWidth = Dimensions.get("screen").width;
  const { favorites, setFavorites } = useContext(favoritesContext);
  const { updateCourse, userData } = useContext(userDetailsContext);

  const isFavorite = (question) => {
    return favorites?.some((item) => item?.question === question);
  };

  const handleFlashcardViewed = async (flashcardId) => {
    if (favorite) return;
    const currentProgress = userData?.progress?.[courseTitle] || {};
    const previousViewed = currentProgress.flashcardsViewed || [];

    console.log("clicked", flashcardId);
    console.log("currentProgress", currentProgress);
    console.log("previousViewed", previousViewed);

    // Avoid duplicates
    const updatedFlashcards = previousViewed.includes(flashcardId)
      ? previousViewed
      : [...previousViewed, flashcardId];

    console.log("updatedFlashcards", updatedFlashcards);

    await updateCourse(courseTitle, {
      ...currentProgress,
      flashcardsViewed: updatedFlashcards,
    });
  };

  const addFavorite = async (question, title, answer) => {
    try {
      const newFavorite = { question, title, answer };
      const currentFavorites = Array.isArray(favorites) ? favorites : [];

      const exists = currentFavorites.some(
        (item) => item.question === question
      );
      if (exists) return;

      const updatedFavorites = [...currentFavorites, newFavorite];
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      console.log("Added favorite:", updatedFavorites);
    } catch (err) {
      console.error("Error adding favorite:", err);
    }
  };

  const removeFavorite = async (question) => {
    try {
      const currentFavorites = Array.isArray(favorites) ? favorites : [];
      const updatedFavorites = currentFavorites.filter(
        (item) => item.question !== question
      );

      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      console.log("Removed favorite:", updatedFavorites);
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  return (
    <View style={{ marginBottom: 50 }}>
      <FlatList
        data={flashcards}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
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
                friction={12}
                perspective={1500}
                flipVertical
                clickable
                onFlipEnd={() => handleFlashcardViewed(item?.question)}
              >
                {/* Front Side */}
                <View className="bg-white flex-1 rounded-2xl justify-center items-center px-14">
                  <View className="absolute bottom-2 p-4 z-50">
                    <Pressable
                      onPress={() => {
                        requestAnimationFrame(() => {
                          if (favorite) {
                            removeFavorite(currentQuestion);
                          } else {
                            addFavorite(item.question, title, item.answer);
                          }
                        });
                      }}
                    >
                      <Ionicons
                        name={favorite ? "heart" : "heart-outline"}
                        size={30}
                        color={favorite ? colors.ERROR : colors.PRIMARY}
                      />
                    </Pressable>
                  </View>

                  {item?.title && (
                    <View className="absolute border border-gray-300 top-2 p-2 rounded-lg">
                      <Text className="text-center font-nunito-semibold">
                        {item?.title}
                      </Text>
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
