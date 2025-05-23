import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeScreen from "../../../components/SafeScreen";
import { courseIcons } from "../../../constants/constants";
import { allCoursesContext } from "../../../context/context";

export default function CourseId() {
  const { coursesId } = useLocalSearchParams();
  const { allCourses, selectedCourse, setSelectedModule } =
    useContext(allCoursesContext);
  const router = useRouter();
  const [courseSelected, setCourseSelected] = useState("All");
  const course = allCourses.find((item) => item?.id === coursesId);
  const [loading, setLoading] = useState(false);
  const filteredCourses =
    courseSelected === "All"
      ? course?.modules
      : course?.modules.filter((course) => course.level === courseSelected);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setLoading(true);
        setSelectedModule(item);
        router.push(`/learn/courses/modules/${item.moduleId}`);
        setLoading(false);
      }}
      className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-row gap-4"
    >
      {loading && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -18 }, { translateY: -18 }],
          }}
        >
          <ActivityIndicator color="black" size={36} />
        </View>
      )}
      <View style={{ width: 100, height: 100 }}>
        <Image
          source={courseIcons[selectedCourse?.icon]}
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
        {/* <Text className="text-gray-700 text-sm">{item.description}</Text> */}
        <View className="flex-col justify-between">
          <Text className="text-sm text-gray-500 font-nunito">
            Level: {item.level}
          </Text>
          <Text className="text-xs text-gray-500 font-nunito">
            {item.lessons?.length || 0} Lessons
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <SafeScreen>
      <View className="flex flex-row gap-4 px-2">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={35} color="black" />
        </Pressable>
        <Text className="text-2xl font-quicksand-bold mb-6 text-gray-800 text-center">
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
              className={`text-base font-nunito-bold ${
                courseSelected === level ? "text-black" : "text-gray-400"
              }`}
            >
              {level}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.moduleId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeScreen>
  );
}
