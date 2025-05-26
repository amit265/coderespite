import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import { courseIcons } from "../../constants/constants";
import { adConfigContext, allCoursesContext } from "../../context/context";

export default function Learn() {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const { allCourses, setSelectedCourse, setUpdate } =
    useContext(allCoursesContext);
  if (allCourses?.length === 0) setUpdate((prev) => !prev);
  console.log("allcourses", allCourses.length);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        setClickCount((prev) => prev + 1);
        setSelectedCourse(item);
        router.push(`/learn/courses/${item?.id}`);
      }}
      className="mb-6 rounded-3xl overflow-hidden"
      style={{ width: 160, height: 160, position: "relative" }}
      activeOpacity={0.85}
    >
      <Image
        source={
          courseIcons[item?.icon] || require("../../assets/default-icon.png")
        }
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          borderRadius: 20,
        }}
      />
      <View className="absolute flex justify-center items-center w-full h-full rounded-3xl" style={{backgroundColor: "rgba(0, 0, 0, 0.3)"}}>
        <Text
          className="text-white text-2xl font-nunito-semibold"
          numberOfLines={1}
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
