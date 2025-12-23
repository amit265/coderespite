import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useMemo, useState, useRef, useEffect } from "react";
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
import { courseIcons } from "../../../constants/constants";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../context/context";
import { BannerAdComponent } from "../../../services/AdManager";
import PageTransition from "../../../components/PageTransition";

// --- Animated Module Card ---
const AnimatedModuleCard = ({ item, index, onPress, attempted, courseIcon }) => {
  // 1. Entrance Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // 2. Press Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset values if the item is recycled (important for filtering)
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // Stagger based on index
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
  }, [index]); // Re-run if index changes (list reorder)

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
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
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
            source={courseIcon}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              borderRadius: 16,
            }}
          />
          {attempted && (
            <View className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm">
              <MaterialCommunityIcons
                name="checkbox-marked-circle"
                size={22}
                color={attempted?.score > 70 ? "#AAFF00" : "transparent"}
              />
            </View>
          )}
        </View>
        <View className="flex-1 justify-center gap-2">
          <Text
            className="text-base font-nunito-bold text-black"
            numberOfLines={3}
          >
            {item.title}
          </Text>
          <View className="flex flex-col gap-2">
            <Text className="text-xs text-gray-500 font-nunito bg-gray-100 self-start px-2 py-1 rounded-md overflow-hidden">
              {item.level}
            </Text>
            <View className="flex flex-row justify-between gap-2">
              <View className="flex flex-row items-center gap-1 mt-1">
                <AntDesign name="book" size={14} color="gray" />
                <Text className="text-xs text-gray-500 font-nunito">
                  {item.lessons?.length || 0} Lessons
                </Text>
              </View>
              {attempted && (
                <View className="flex flex-row items-end gap-1">
                  <FontAwesome
                    name={attempted?.score > 70 ? "star" : "star-o"}
                    size={16}
                    color={attempted?.score > 70 ? "#AAFF00" : "#FF0000"}
                  />
                  <Text className="text-xs font-nunito-semibold text-gray-800">
                    {attempted?.score}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function CourseId() {
  const { coursesId } = useLocalSearchParams();
  const router = useRouter();

  const { allCourses } = useContext(allCoursesContext);
  const { userData } = useContext(userDetailsContext);
  const { setClickCount } = useContext(adConfigContext);

  const [courseSelected, setCourseSelected] = useState("All");

  const selectedCourse = useMemo(
    () => allCourses.find((item) => item?.id === coursesId),
    [allCourses, coursesId]
  );

  const filteredModules = useMemo(() => {
    if (!selectedCourse?.modules) return [];
    return courseSelected === "All"
      ? selectedCourse.modules
      : selectedCourse.modules.filter((m) => m.level === courseSelected);
  }, [selectedCourse, courseSelected]);

  const allAttemptedQuizzes = useMemo(() => {
    const progress = userData?.progress;
    return Object.values(progress || {}).flatMap(
      (course) => course?.attemptedQuizzes || []
    );
  }, [userData]);

  const attemptedInThisCourse = useMemo(
    () => allAttemptedQuizzes.filter((q) => q.courseId === coursesId),
    [allAttemptedQuizzes, coursesId]
  );

  const renderModuleItem = ({ item, index }) => {
    const attempted = attemptedInThisCourse.find(
      (quiz) => quiz?.moduleId === item?.id
    );

    const courseIcon =
      courseIcons[selectedCourse?.icon] ??
      require("../../../assets/default-icon.png");

    return (
      <AnimatedModuleCard 
        item={item}
        index={index}
        courseIcon={courseIcon}
        attempted={attempted}
        onPress={() => {
            // Delay for animation
            setTimeout(() => {
                setClickCount((prev) => prev + 1);
                router.push({
                    pathname: `/learn/courses/modules/${item.id}`,
                    params: { courseId: item.courseId },
                });
            }, 150);
        }}
      />
    );
  };

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  if (!selectedCourse) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-nunito-bold text-black">
            Course not found
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header */}
        <View
          className="flex flex-row w-full justify-start px-2 mb-4"
          style={{ backgroundColor: colors.BACKGROUND, gap: 8 }}
        >
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>
          <Text
            style={{
              fontFamily: "nunito-bold",
              color: colors.TEXT,
              textAlign: "left",
              flex: 1,
              fontSize: 20,
            }}
            numberOfLines={1}
          >
            {selectedCourse?.title}
          </Text>
        </View>

        {/* Filter Pills */}
        <View className="mb-4">
            <FlatList 
                data={levels}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                keyExtractor={(item) => item}
                renderItem={({item}) => (
                    <Pressable
                        onPress={() => setCourseSelected(item)}
                        style={{
                            backgroundColor: courseSelected === item ? colors.PRIMARY : "#F3F4F6", // Blue vs Light Gray
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 20,
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: courseSelected === item ? colors.PRIMARY : "#E5E7EB"
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: "nunito-semibold",
                                color: courseSelected === item ? "white" : "#4B5563"
                            }}
                        >
                            {item}
                        </Text>
                    </Pressable>
                )}
            />
        </View>

        {/* Content List */}
        {filteredModules.length === 0 ? (
            <View className="flex-1 items-center justify-center mt-10">
                <Text className="text-lg font-nunito-bold text-gray-400">
                    No modules found for this level.
                </Text>
            </View>
        ) : (
            <FlatList
                data={filteredModules}
                renderItem={renderModuleItem}
                keyExtractor={(item) => item.id.toString() + item.title}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            />
        )}

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