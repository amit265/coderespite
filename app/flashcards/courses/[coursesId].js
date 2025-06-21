import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  const { allCourses } =
    useContext(allCoursesContext);
  const router = useRouter();

  const course = useMemo(
    () => allCourses.find((item) => item?.id === coursesId),
    [allCourses, coursesId]
  );

  // console.log("Selected Course:", course?.flashcards);
  

  // pathname: "/quizExplainer/",
  // params: {
  //   questionParams: JSON.stringify(quizItem),
  // },

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setClickCount(prev => prev + 1)
        router.push({
          pathname: `/flashcards/courses/modules/${item?.id}`,
          params: {
            courseId: item?.courseId,
          },
        });
      }}
      className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-row gap-4"
    >
      <View style={{ width: 100, height: 100 }}>
        <Image
          source={flashcardIcons[course?.icon]||
            require("../../../assets/default-icon.png")}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
            borderRadius: 20,
          }}
        ></Image>
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-lg font-nunito-bold text-black mb-1">
          {item.title}
        </Text>
        <View className="flex-col justify-between">
          <View className = "flex flex-row items-center gap-2">
          <MaterialCommunityIcons name="cards-outline" size={20} color="gray" />
          <Text className="text-sm text-gray-500 font-nunito">
            {item?.flashcards?.length || 0} cards
          </Text>
          </View>
        
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <View className="flex flex-row gap-4 px-2 justify-between">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
        <Text className="text-2xl font-nunito-bold mb-6 text-gray-800 text-center" numberOfLines={1}>
          {course?.title} 
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
