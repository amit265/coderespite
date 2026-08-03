import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useWindowDimensions, FlatList, Pressable, Text, View, Animated, Easing, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import colors from "../constants/colors";
import { favoritesContext, userDetailsContext, allCoursesContext } from "../context/context";
import { registerFlashcardInSRS, removeFlashcardFromSRS } from "../services/srsService";

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

// Custom animated cross-platform FlipCard
const FlipCardComponent = ({ children, isFlipped, onPress, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = isFlipped ? 180 : 0;
    Animated.spring(animatedValue, {
      toValue,
      friction: 8,
      tension: 15,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const [frontView, backView] = React.Children.toArray(children);

  return (
    <Pressable onPress={onPress} style={style}>
      {/* Front Card */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
            backfaceVisibility: "hidden",
            zIndex: isFlipped ? 0 : 1,
          },
        ]}
      >
        {frontView}
      </Animated.View>

      {/* Back Card */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
            backfaceVisibility: "hidden",
            zIndex: isFlipped ? 1 : 0,
          },
        ]}
      >
        {backView}
      </Animated.View>
    </Pressable>
  );
};

// Individual Flashcard Item with local state
const FlashcardListItem = ({
  item,
  index,
  screenWidth,
  isFav,
  handleHeartPress,
  handleFlashcardViewed,
  title,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePress = () => {
    setIsFlipped((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!isFlipped) {
      handleFlashcardViewed(item);
    }
  };

  return (
    <AnimatedCardContainer index={index}>
      <FlipCardComponent
        isFlipped={isFlipped}
        onPress={handlePress}
        style={{
          width: screenWidth * 0.78,
          height: 200,
          borderRadius: 20,
          backgroundColor: "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Front Side */}
        <View
          className="bg-white flex-1 rounded-2xl justify-center items-center px-8"
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#f0f0f0",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Heart Icon */}
          <View className="absolute bottom-4 z-50">
            <AnimatedHeart
              isFav={isFav}
              onPress={() => handleHeartPress(item, isFav, item.question)}
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
            width: "100%",
            height: "100%",
          }}
        >
          <Text className="text-white text-lg text-center font-nunito-bold leading-7">
            {item?.answer}
          </Text>
        </View>
      </FlipCardComponent>
    </AnimatedCardContainer>
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
  const { updateCourse, userData, gainXP, logActivity } = useContext(userDetailsContext);
  const { allCourses } = useContext(allCoursesContext);

  const findCourseTitleForFlashcard = (question) => {
    if (!allCourses) return "";
    for (const course of allCourses) {
      if (course?.modules) {
        for (const mod of course.modules) {
          if (mod?.flashcards?.some((fc) => fc.question === question)) {
            return course.title;
          }
        }
      }
    }
    return "";
  };

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

    if (logActivity) {
      await logActivity();
    }

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

    await registerFlashcardInSRS(item, courseTitle, title);

    await gainXP(2);
  };

  const handleFlashcardLoved = async (item) => {
    const activeCourseTitle = courseTitle || findCourseTitleForFlashcard(item?.question);
    if (!activeCourseTitle) return;

    const currentProgress = userData?.progress?.[activeCourseTitle] || {};
    const previousLoved = currentProgress.flashcardsLoved || [];
    const now = new Date();
    const lovedDate = now.toISOString().split("T")[0];

    const flashCardDetail = {
      title,
      courseTitle: activeCourseTitle,
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

    await updateCourse(activeCourseTitle, {
      flashcardsLoved: updatedFlashcardsLoved,
    });

    await registerFlashcardInSRS(item, activeCourseTitle, title);
  };

  const removeFlashcardLoved = async (question) => {
    const activeCourseTitle = courseTitle || findCourseTitleForFlashcard(question);
    if (!activeCourseTitle) return;

    const currentProgress = userData?.progress?.[activeCourseTitle] || {};
    const previousLoved = currentProgress.flashcardsLoved || [];

    const normalize = (str) => String(str || "").trim().toLowerCase();

    const updatedLoved = previousLoved.filter(
      (fc) => normalize(fc?.question) !== normalize(question)
    );

    await updateCourse(activeCourseTitle, {
      flashcardsLoved: updatedLoved,
    });

    await removeFlashcardFromSRS(question);
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
        await handleFlashcardLoved(item);
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.question}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        renderItem={({ item, index }) => (
          <FlashcardListItem
            item={item}
            index={index}
            screenWidth={screenWidth}
            isFav={isFavorite(item.question)}
            handleHeartPress={handleHeartPress}
            handleFlashcardViewed={handleFlashcardViewed}
            title={title}
          />
        )}
      />
    </View>
  );
}