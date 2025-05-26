import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
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
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../context/context";

export default function Quiz() {
  const router = useRouter();

  const {
    allCourses = [],
    setSelectedCourse,
    selectedQuiz,
    setSelectedQuiz,
  } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);
  const { userData } = useContext(userDetailsContext);

  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);

  useEffect(() => {
    const progress = userData?.progress;
    const allAttemptedQuizzes = Object.values(progress || {}).flatMap(
      (course) => course.attemptedQuizzes || []
    );
    setAttemptedQuizzes(allAttemptedQuizzes);
    console.log("allAttemptedQuizzes", allAttemptedQuizzes);
  }, [userData]);

  console.log("selectedQuiz", selectedQuiz);

  // ✅ Memoized render function to avoid re-creating inside map()
  const renderQuizItem = useCallback(
    (section) => {
      const RenderItem = ({ item }) => {
        const matchedAttempt = attemptedQuizzes.find(
          (quiz) => quiz.courseId === section.id && quiz.id === item.id
        );

        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedCourse(section);
              setClickCount((prev) => prev + 1);
              setSelectedQuiz(item);
              router.push(`/quiz/courses/${item?.id}`);
            }}
            className="m-2 p-4 pb-8 rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-300 flex justify-center items-center"
            activeOpacity={0.85}
          >
            <View className="w-56 h-36 rounded-2xl overflow-hidden mb-4">
              <Image
                source={
                  courseIcons[section?.icon] ||
                  require("../../assets/default-icon.png")
                }
                className="w-full h-full rounded-2xl"
                style={{ resizeMode: "cover" }}
              />
              {matchedAttempt && (
                <View className="absolute top-2 right-2 rounded-full px-2 py-1">
                  <MaterialCommunityIcons
                    name="checkbox-marked-circle"
                    size={24}
                    color={matchedAttempt?.score > 60 ? "#AAFF00" : "#FF0000"}
                  />
                </View>
              )}
            </View>
            <View className="flex w-full">
              <Text className="text-base font-nunito-bold text-gray-800 text-left mx-2">
                {item?.title?.length > 20
                  ? item?.title.slice(0, 20) + "..."
                  : item?.title}
              </Text>
              <View className="flex flex-row justify-between items-center gap-2 mt-2">
                <View className="flex flex-row  items-center gap-2">
                  <AntDesign name="book" size={20} color="black" />
                  <Text className="text-base font-nunito-semibold text-gray-800">
                    {item?.quiz?.length} Questions
                  </Text>
                </View>

                {matchedAttempt && (
                  <View className="flex flex-row  items-center gap-2 mt-2">
                    <FontAwesome
                      name={matchedAttempt?.score > 60 ? "star" : "star-o"}
                      size={20}
                      color={matchedAttempt?.score > 60 ? "#AAFF00" : "#FF0000"}
                    />
                    <Text className="text-base font-nunito-semibold text-gray-800">
                      {matchedAttempt?.score}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      };

      RenderItem.displayName = `RenderItemForSection_${section?.id}`;
      return RenderItem;
    },
    [
      attemptedQuizzes,
      router,
      setClickCount,
      setSelectedCourse,
      setSelectedQuiz,
    ]
  );

  return (
    <SafeScreen>
      <Text className="text-2xl font-nunito-bold mb-6 text-gray-800 text-center">
        Quiz
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-8 pb-10">
          {allCourses.length === 0 ? (
            <Text className="text-center text-gray-500 font-nunito-bold">
              No quiz courses available.
            </Text>
          ) : (
            allCourses.map((section) => (
              <View key={section.id}>
                <Text className="text-lg font-nunito-bold text-gray-700 my-3 px-4">
                  {section?.title || "Untitled Section"}
                </Text>

                {Array.isArray(section.quizzes) &&
                section.quizzes.length > 0 ? (
                  <FlatList
                    data={section.quizzes}
                    renderItem={renderQuizItem(section)}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                  />
                ) : (
                  <Text className="text-gray-400 italic px-6">
                    No quizzes in this section.
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
