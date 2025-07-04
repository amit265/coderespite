import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import { flashcardIcons } from "../../constants/constants";
import { adConfigContext, allCoursesContext } from "../../context/context";

export default function FlashCards() {
  const router = useRouter();
  const { allCourses, setSelectedCourse } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        setSelectedCourse(item);
        setClickCount(prev => prev + 1)
        router.push(`/flashcards/courses/${item?.id}`);
      }}
      className="mb-6 rounded-3xl overflow-hidden"
      style={{ width: 160, height: 160, position: "relative" }}
      activeOpacity={0.85}
    >
      <Image
        source={flashcardIcons[item?.icon]||
          require("../../assets/default-icon.png")}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          borderRadius: 20,
        }}
      />
      <View className="absolute flex p-2 pl-4 w-full h-full rounded-3xl" style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
        <Text
          className="text-white text-lg font-nunito"

        >
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
        FlashCards
      </Text>

      <FlatList
        data={allCourses}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
      />
    </SafeScreen>
  );
}
