import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import { courseIcons } from "../../constants/constants";
import { allCoursesContext } from "../../context/context";

export default function Learn() {
  const router = useRouter();
  const { allCourses, setSelectedCourse, setUpdate } =
    useContext(allCoursesContext);
  if (allCourses?.length === 0) setUpdate((prev) => !prev);
  console.log("allcourses", allCourses.length);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        setSelectedCourse(item);
        router.push(`/learn/courses/${item?.id}`);
      }}
      className="mb-6 rounded-3xl overflow-hidden"
      style={{ width: 160, height: 160 }}
      activeOpacity={0.85}
    >
      <Image
        source={courseIcons[item?.icon]}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          borderRadius: 20,
        }}
      />
      <View className="absolute">
        <Text
          className="text-white text-lg font-nunito-semibold"
          style={{ left: "20%" }}
        >
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <Text className="text-2xl font-quicksand-bold mb-6 text-gray-800 text-center py-4">
        Courses
      </Text>

      <FlatList
        data={allCourses}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 8 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </SafeScreen>
  );
}
