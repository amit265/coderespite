import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useMemo, useRef, useEffect } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  Animated,
} from "react-native";
import SafeScreen from "../../../components/SafeScreen";
import colors from "../../../constants/colors";
import { flashcardIcons } from "../../../constants/constants";
import { adConfigContext, allCoursesContext } from "../../../context/context";
import { BannerAdComponent } from "../../../services/AdManager";
import PageTransition from "../../../components/PageTransition";

// --- Animated Flashcard Module Card ---
const AnimatedFlashcardModuleCard = ({ item, index, onPress, iconSource }) => {
  // 1. Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // 2. Press Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: 'white',
          borderRadius: 16, // rounded-xl
          padding: 16,      // p-4
          marginBottom: 16, // mb-4
          flexDirection: 'row',
          gap: 16,
          // Shadows
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ width: 100, height: 100 }}>
          <Image
            source={iconSource}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              borderRadius: 16, // rounded-2xl
            }}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            className="text-lg font-nunito-bold text-black mb-1"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="cards-outline" size={20} color="gray" />
              <Text className="text-sm text-gray-500 font-nunito">
                {item?.flashcards?.length || 0} cards
              </Text>
            </View>
          </View>
        </View>
        {/* Optional Chevron for affordance */}
        <View style={{ justifyContent: 'center' }}>
             <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function CourseId() {
  const { coursesId } = useLocalSearchParams();
  const { setClickCount } = useContext(adConfigContext);
  const { allCourses } = useContext(allCoursesContext);
  const router = useRouter();

  const course = useMemo(
    () => allCourses.find((item) => item?.id === coursesId),
    [allCourses, coursesId]
  );

  const renderModuleItem = ({ item, index }) => {
    const iconSource = flashcardIcons[course?.icon] || require("../../../assets/default-icon.png");

    return (
      <AnimatedFlashcardModuleCard
        item={item}
        index={index}
        iconSource={iconSource}
        onPress={() => {
          // Animation Delay
          setTimeout(() => {
            setClickCount((prev) => prev + 1);
            router.push({
              pathname: `/flashcards/courses/modules/${item?.id}`,
              params: {
                courseId: item?.courseId,
              },
            });
          }, 150);
        }}
      />
    );
  };

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header */}
        <View className="flex flex-row gap-4 px-2 justify-between items-center mb-4">
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>
          
          <Text 
            className="text-2xl font-nunito-bold text-gray-800 text-center flex-1" 
            numberOfLines={1}
          >
            {course?.title || "Flashcards"}
          </Text>

          <Pressable onPress={() => router.push("/flashcards/favoritesFc")} hitSlop={10}>
            <Ionicons
              name="heart"
              size={32}
              color="red"
              style={{ paddingRight: 10 }}
            />
          </Pressable>
        </View>

        {/* Content */}
        <FlatList
          data={course?.flashcards}
          renderItem={renderModuleItem}
          keyExtractor={(item) => item.moduleId || item.id}
          showsVerticalScrollIndicator={false}
          // Increase bottom padding to accommodate Ad
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        />

        {/* Bottom Banner Ad */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 4,
            backgroundColor: colors.BACKGROUND,
          }}
        >
          <BannerAdComponent />
        </View>
      </SafeScreen>
    </PageTransition>
  );
}