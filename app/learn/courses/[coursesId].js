import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
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
import { courseIcons } from "../../../constants/constants";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../context/context";

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

  const renderModuleItem = ({ item }) => {
    const attempted = attemptedInThisCourse.find(
      (quiz) => quiz?.moduleId === item?.id
    );

    const courseIcon = courseIcons[selectedCourse?.icon] ?? require("../../../assets/default-icon.png");

    return (
      <TouchableOpacity
        onPress={() => {
          setClickCount((prev) => prev + 1);
          router.push({
            pathname: `/learn/courses/modules/${item.id}`,
            params: { courseId: item.courseId },
          });
        }}
        className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-row gap-4"
      >
        <View style={{ width: 120, height: 120 }}>
          <Image
            source={courseIcon}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              borderRadius: 20,
            }}
          />
          {attempted && (
            <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <MaterialCommunityIcons
                name="checkbox-marked-circle"
                size={24}
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
            <Text className="text-sm text-gray-500 font-nunito">
              Level: {item.level}
            </Text>
            <View className="flex flex-row justify-between gap-2">
              <View className="flex flex-row items-center gap-1 mt-1">
                <AntDesign name="book" size={16} color="gray" />
                <Text className="text-xs text-gray-500 font-nunito">
                  {item.lessons?.length || 0} Lessons
                </Text>
              </View>
              {attempted && (
                <View className="flex flex-row items-end gap-2">
                  <FontAwesome
                    name={attempted?.score > 70 ? "star" : "star-o"}
                    size={18}
                    color={attempted?.score > 70 ? "#AAFF00" : "#FF0000"}
                  />
                  <Text className="text-sm font-nunito-semibold text-gray-800">
                    {attempted?.score}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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

  if (filteredModules.length === 0) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-nunito-bold text-black">
            No modules available for this course
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="flex flex-row gap-4 px-2 items-center">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
        <Text
          className="text-2xl font-nunito-bold text-black text-center flex-1"
          numberOfLines={1}
        >
          {selectedCourse?.title}
        </Text>
      </View>

      <View className="flex-row justify-center gap-2 mb-6 flex-wrap">
        {levels.map((level) => (
          <Pressable
            key={level}
            onPress={() => setCourseSelected(level)}
            className={`px-4 py-2 rounded-full ${
              courseSelected === level ? "border-b border-[#11426B]" : ""
            }`}
          >
            <Text
              className={`text-base font-nunito-semibold ${
                courseSelected === level ? "text-black" : "text-gray-400"
              }`}
            >
              {level}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredModules}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.id.toString() + item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

 
    </SafeScreen>
  );
}
