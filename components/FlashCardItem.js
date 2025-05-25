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
  const { updateCourse, userData, gainXP } = useContext(userDetailsContext);
  const isFavorite = (question) => {
    return favorites?.some((item) => item?.question === question);
  };

  const handleFlashcardViewed = async (item) => {
    if (favorite) return;
 
    const currentProgress = userData?.progress?.[courseTitle] || {};
    const previousViewed = currentProgress.flashcardsViewed || [];
    const alreadyViewed = previousViewed.some(
      (fc) => fc?.question === item?.question
    );
  
    if (alreadyViewed) return; // ✅ Skip if already viewed
  


    const now = new Date();
    const viewedDate = now.toISOString().split("T")[0];

    console.log("handle flash card again");

    const flashCardDetail = {
      title,
      courseTitle,
      question: item?.question,
      answer: item?.answer,
      date: viewedDate,
    };

    const updatedFlashcards = previousViewed.some(
      (fc) => fc?.question === item?.question
    )
      ? previousViewed
      : [...previousViewed, flashCardDetail];

    await updateCourse(courseTitle, {
      flashcardsViewed: updatedFlashcards,
    });

    await gainXP(2);

  };

  const handleFlashcardLoved = async (item) => {
    if (favorite) return;

    const currentProgress = userData?.progress?.[courseTitle] || {};
    const previousLoved = currentProgress.flashcardsLoved || [];
    const now = new Date();
    const lovedDate = now.toISOString().split("T")[0];

    const flashCardDetail = {
      title,
      courseTitle,
      question: item?.question,
      answer: item?.answer,
      date: lovedDate,
    };

    const isAlreadyLoved = previousLoved.some(
      (fc) => fc.question === item?.question
    );

    const updatedFlashcardsLoved = isAlreadyLoved
      ? previousLoved
      : [...previousLoved, flashCardDetail];

    await updateCourse(courseTitle, {
      flashcardsLoved: updatedFlashcardsLoved,
    });
  };

  const removeFlashcardLoved = async (question) => {
    if (favorite) return;

    console.log("remove flash card called");
    const currentProgress = userData?.progress?.[courseTitle] || {};
    const previousLoved = currentProgress.flashcardsLoved || [];


    const normalize = (str) =>
      String(str || "")
        .trim()
        .toLowerCase();

    const updatedLoved = previousLoved.filter(
      (fc) => normalize(fc?.question) !== normalize(question)
    );
   
    await updateCourse(courseTitle, {
      flashcardsLoved: updatedLoved,
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
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  return (
    <View>
      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.question}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}

        renderItem={({ item }) => {
          const currentQuestion = item.question;
          const isFav = isFavorite(currentQuestion);

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
                onFlipEnd={() => handleFlashcardViewed(item)}
              >
                {/* Front Side */}
                <View className="bg-white flex-1 rounded-2xl justify-center items-center px-14">
                  <View className="absolute bottom-2 p-4 z-50">
                    <Pressable
                      onPress={async () => {
                        requestAnimationFrame(async () => {
                          if (isFav) {
                            await removeFavorite(currentQuestion);
                            await removeFlashcardLoved(currentQuestion);
                          } else {
                            await addFavorite(
                              item.question,
                              title,
                              item.answer
                            );
                          }

                          await handleFlashcardLoved(item);
                        });
                      }}
                    >
                      <Ionicons
                        name={isFav ? "heart" : "heart-outline"}
                        size={30}
                        color={isFav ? colors.ERROR : colors.PRIMARY}
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
