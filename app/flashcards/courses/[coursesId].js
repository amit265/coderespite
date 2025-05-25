import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeScreen from "../../../components/SafeScreen";
import colors from "../../../constants/colors";
import { flashcardIcons } from "../../../constants/constants";
import { adConfigContext, allCoursesContext } from "../../../context/context";
import { BannerAdComponent } from "../../../services/AdManager";

export default function CourseId() {
  const { coursesId } = useLocalSearchParams();
  const { setClickCount } = useContext(adConfigContext);
  const { allCourses, selectedCourse, setSelectedModule } =
    useContext(allCoursesContext);
  const router = useRouter();
  const course = useMemo(
    () => allCourses.find((item) => item?.id === coursesId),
    [allCourses, coursesId]
  );
  const courseTitle = course?.title;
  console.log("courses", courseTitle);

  // pathname: "/quizExplainer/",
  // params: {
  //   questionParams: JSON.stringify(quizItem),
  // },
  console.log("Navigating to module with courseTitle:", courseTitle);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setClickCount(prev => prev + 1)
        setSelectedModule(item);
        router.push({
          pathname: `/flashcards/courses/modules/[moduleId]`,
          params: {
            moduleId: item.moduleId,
            courseTitle: courseTitle,
          },
        });
      }}
      className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-row gap-4"
    >
      <View style={{ width: 100, height: 100 }}>
        <Image
          source={flashcardIcons[selectedCourse?.icon]}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
            borderRadius: 20,
          }}
        ></Image>
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-xl font-nunito-bold text-black mb-1">
          {item.title}
        </Text>
        <View className="flex-col justify-between">
          <Text className="text-xs text-gray-500 font-nunito">
            {item?.flashcards?.length || 0} cards
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <View className="flex flex-row gap-4 px-2 justify-between">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={35} color="black" />
        </Pressable>
        <Text className="text-2xl font-quicksand-bold mb-6 text-gray-800 text-center">
          {selectedCourse?.title} FlashCards
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
      <FlatList
        data={course?.flashcards}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.moduleId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
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
          backgroundColor: colors.BACKGROUND, // Optional: to avoid transparency glitches
        }}
      >
        <BannerAdComponent />
      </View>
    </SafeScreen>
  );
}
