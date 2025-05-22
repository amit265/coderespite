import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeScreen from "../../components/SafeScreen";
import { courseIcons } from "../../constants/constants";
import { allCoursesContext } from "../../context/context";

export default function Quiz() {
  const router = useRouter();
  const { allCourses, setSelectedCourse, setSelectedQuiz } = useContext(allCoursesContext);

  const renderQuizItem = (section) => {
    const QuizItem = ({ item }) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          setSelectedCourse(section);
          setSelectedQuiz(item);
          router.push(`/quiz/courses/${item?.id}`);
        }}
        className="m-2 p-4 pb-8 rounded-2xl overflow-hidden bg-white shadow  flex justify-center items-center"
        activeOpacity={0.85}
      >
        <View className="p-4 aspect-square w-48 h-56 ">
          <Image
            source={courseIcons[section?.icon]}
            className="w-full h-full rounded-2xl"
            style={{ resizeMode: "cover" }}
          />
        </View>
        <View className="flex justify-center items-center">
          <Text className=" text-sm font-semibold text-gray-800 text-center">
            {item?.title?.length > 20
              ? item?.title.slice(0, 20) + "..."
              : item?.title}
          </Text>
        </View>
      </TouchableOpacity>
    );

    QuizItem.displayName = "QuizItem"; // optional but silences ESLint

    return QuizItem;
  };

  return (
    <SafeScreen>
      <Text className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Quiz
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-8 px-4 pb-10">
          {allCourses.map((section) => (
            <View key={section.id}>
              <Text className="text-lg font-semibold text-gray-700 mb-3">
                {section.title}
              </Text>
              <FlatList
                data={section.quizzes}
                renderItem={renderQuizItem(section)}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
