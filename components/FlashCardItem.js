import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef } from "react";
import { useWindowDimensions, FlatList, Pressable, Text, View, Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
import FlipCard from "react-native-flip-card";
import colors from "../constants/colors";
import { favoritesContext, userDetailsContext } from "../context/context";

// --- 1. Animated Heart Component ---
const AnimatedHeart = ({ isFav, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Run the "Pop" animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3, // Scale up
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // Bounce back
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger the actual logic
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={15}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isFav ? "heart" : "heart-outline"}
          size={28} // Slightly larger for better tap target
          color={isFav ? colors.ERROR : colors.PRIMARY}
        />
      </Animated.View>
    </Pressable>
  );
};

// --- 2. Animated Card Wrapper (Entrance) ---
const AnimatedCardContainer = ({ children, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger based on index
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginTop: 32, // mt-8 equivalent
        alignItems: 'center',
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function FlashCardItem({
  flashcards,
  title,
  courseTitle,
  favorite,
}) {
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width || 480, 480);
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

    if (alreadyViewed) return;

    const now = new Date();
    const viewedDate = now.toISOString().split("T")[0];

    const flashCardDetail = {
      title,
      courseTitle,
      question: item?.question,
      answer: item?.answer,
      date: viewedDate,
    };

    const updatedFlashcards = [...previousViewed, flashCardDetail];

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

    const currentProgress = userData?.progress?.[courseTitle] || {};
    const previousLoved = currentProgress.flashcardsLoved || [];

    const normalize = (str) => String(str || "").trim().toLowerCase();

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

  const handleHeartPress = async (item, isFav, currentQuestion) => {
    requestAnimationFrame(async () => {
      if (isFav) {
        await removeFavorite(currentQuestion);
        await removeFlashcardLoved(currentQuestion);
      } else {
        await addFavorite(item.question, title, item.answer);
      }
      await handleFlashcardLoved(item);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.question}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        renderItem={({ item, index }) => {
          const currentQuestion = item.question;
          const isFav = isFavorite(currentQuestion);

          return (
            <AnimatedCardContainer index={index}>
              <FlipCard
                style={{
                  width: screenWidth * 0.78,
                  height: 200,
                  borderRadius: 20,
                  // Shadows for the card itself
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                  backgroundColor: 'transparent', // Let inner views handle bg
                }}
                friction={12}
                perspective={1500}
                flipVertical
                clickable
                onFlipEnd={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  handleFlashcardViewed(item);
                }}
              >
                {/* Front Side */}
                <View 
                  className="bg-white flex-1 rounded-2xl justify-center items-center px-8"
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden', 
                    borderWidth: 1,
                    borderColor: '#f0f0f0'
                  }}
                >
                  {/* Heart Icon with Pop Animation */}
                  <View className="absolute bottom-4 z-50">
                    <AnimatedHeart 
                        isFav={isFav} 
                        onPress={() => handleHeartPress(item, isFav, currentQuestion)} 
                    />
                  </View>

                  {item?.title && (
                    <View className="absolute top-4 border border-gray-200 px-3 py-1 rounded-full bg-gray-50">
                      <Text
                        className="text-center font-nunito text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {item?.title}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text className="text-xl font-nunito-bold text-center text-gray-800 leading-7">
                      {item?.question}
                    </Text>
                  </View>
                </View>

                {/* Back Side */}
                <View
                  className="flex-1 rounded-2xl justify-center items-center px-6"
                  style={{ 
                    backgroundColor: colors.PRIMARY, 
                    borderRadius: 20,
                  }}
                >
                  <Text className="text-white text-lg text-center font-nunito-bold leading-7">
                    {item?.answer}
                  </Text>
                </View>
              </FlipCard>
            </AnimatedCardContainer>
          );
        }}
      />
    </View>
  );
}