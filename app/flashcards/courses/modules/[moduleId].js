import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import FlashCardItem from "../../../../components/FlashCardItem";
import SafeScreen from "../../../../components/SafeScreen";
import { allCoursesContext } from "../../../../context/context";

export default function ModuleId() {
  const { selectedModule } = useContext(allCoursesContext);
  const { moduleId, courseTitle } = useLocalSearchParams();
  // const courseTitle = JSON.parse(courseTitleParams);
  console.log("use localkfsa", useLocalSearchParams());
  
  useEffect(() => {
    console.log("Course Title:", courseTitle); // parse if JSON string
  }, []);
  // const [expandedLessons, setExpandedLessons] = useState({});
  const router = useRouter();


  if (!selectedModule) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg">Module not found.</Text>
      </View>
    );
  }

  return (
    <SafeScreen>
      <View className="flex-row gap-4 items-center justify-between pb-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={30}
            color="black"
            style={{ paddingLeft: 10 }}
          />
        </Pressable>
        <Text className="text-black font-nunito-bold text-2xl">
          {selectedModule?.title}
        </Text>
        <Pressable onPress={() => router.push("/flashcards/favoritesFc")}>
          <Ionicons
            name="heart"
            size={32}
            color="red"
            style={{ paddingRight: 10 }}
          />
        </Pressable>
      </View>
      <FlashCardItem
        flashcards={selectedModule?.flashcards}
        title={selectedModule?.title}
        courseTitle={courseTitle}
      />
    </SafeScreen>
  );
}
