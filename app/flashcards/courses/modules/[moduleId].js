import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import FlashCardItem from "../../../../components/FlashCardItem";
import SafeScreen from "../../../../components/SafeScreen";
import colors from "../../../../constants/colors";
import { allCoursesContext } from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";
export default function ModuleId() {
  const { moduleId, courseId } = useLocalSearchParams();
  const [selectedModule, setSelectedModule] = useState([]);
  // const courseTitle = JSON.parse(courseTitleParams);
  const { allCourses } = useContext(allCoursesContext);
  const courseTitle = allCourses.find(
    (course) => course?.id === courseId
  )?.title;

  console.log("courseTitle", courseTitle);
  
  useEffect(() => {
    const selectedModule = allCourses
      .find((course) => course?.id === courseId)
      ?.flashcards.find((item) => item.id === moduleId);
    setSelectedModule(selectedModule);
  }, [moduleId, courseId, allCourses]);

  console.log("selectedModule", selectedModule);

  console.log(moduleId, courseId);

  // const [expandedLessons, setExpandedLessons] = useState({});
  const router = useRouter();

  if (!selectedModule) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg font-nunito">
          Flashcard not found.
        </Text>
      </View>
    );
  }

  return (
    <SafeScreen>
      <View>
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>

          <View className="flex-1 mx-4 items-center">
            <Text
              className="text-black font-nunito-bold text-xl text-center"
              numberOfLines={1}
            >
              {selectedModule?.title}
            </Text>
          </View>

          <Pressable onPress={() => router.push("/flashcards/favoritesFc")}>
            <Ionicons name="heart" size={30} color="red" />
          </Pressable>
        </View>

        <FlashCardItem
          flashcards={selectedModule?.flashcards}
          title={selectedModule?.title}
          courseTitle={courseTitle}
        />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 4,
          backgroundColor: colors.BACKGROUND, // Optional: to avoid transparency glitches
        }}
      >
        <BannerAdComponent />
      </View>
    </SafeScreen>
  );
}
