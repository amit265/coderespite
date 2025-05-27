import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SafeScreen from "../../components/SafeScreen";
import colors from "../../constants/colors";
import { courseIcons } from "../../constants/constants";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../context/context";
export default function Quiz() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectCourse, setSelectCourse] = useState("All");

  const {
    allCourses = [],
    setSelectedCourse,
    selectedQuiz,
    setSelectedQuiz,
  } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);
  const { userData } = useContext(userDetailsContext);

  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);

  const getjscoursetitle = allCourses
    .filter((a) => a.id === "javascript")[0]
    ?.modules.map((m) => m.title);

  console.log("getjscoursetitle", getjscoursetitle);

  useEffect(() => {
    const progress = userData?.progress;
    const allAttemptedQuizzes = Object.values(progress || {}).flatMap(
      (course) => course.attemptedQuizzes || []
    );
    setAttemptedQuizzes(allAttemptedQuizzes);
  }, [userData]);

  // ✅ Memoized list of all quizzes with course info
  const filteredQuizzes = useMemo(() => {
    const quizzes = allCourses.flatMap((course) =>
      (course.quizzes || []).map((quiz) => ({
        ...quiz,
        courseId: course.id,
        courseTitle: course.title,
        courseIcon: course.icon,
        courseObject: course,
      }))
    );

    return quizzes.filter((quiz) => {
      const matchesSearch = quiz.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesCourse =
        selectCourse === "All" || quiz.courseTitle === selectCourse;
      return matchesSearch && matchesCourse;
    });
  }, [allCourses, searchText, selectCourse]);

  const renderItem = ({ item }) => {
    const matchedAttempt = attemptedQuizzes.find(
      (quiz) => quiz.courseId === item.courseId && quiz.id === item.id
    );

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedCourse(item.courseObject);
          setClickCount((prev) => prev + 1);
          setSelectedQuiz(item);
          router.push(`/quiz/courses/${item?.id}`);
        }}
        className="m-3 p-6 rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-300 flex justify-center items-center"
        activeOpacity={0.85}
      >
        <View
          className="w-full h-40 rounded-2xl overflow-hidden mb-4"
          style={{ position: "relative", height: 200 }}
        >
          <Image
            source={
              courseIcons[item.courseIcon] ||
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
        <View className="w-full">
          <Text className="text-lg font-nunito-bold text-black" numberOfLines={2}>
            {item?.title}
          </Text>

          <Text className="text-sm font-nunito-semibold text-gray-500 mt-1">
            Course: {item.courseTitle}
          </Text>

          <View className="flex flex-row justify-between items-center gap-2 mt-3">
            <View className="flex flex-row items-center gap-2">
              <AntDesign name="book" size={18} color="black" />
              <Text className="text-sm font-nunito-semibold text-gray-800">
                {item?.quiz?.length} Questions
              </Text>
            </View>

            {matchedAttempt && (
              <View className="flex flex-row items-center gap-2">
                <FontAwesome
                  name={matchedAttempt?.score > 60 ? "star" : "star-o"}
                  size={18}
                  color={matchedAttempt?.score > 60 ? "#AAFF00" : "#FF0000"}
                />
                <Text className="text-sm font-nunito-semibold text-gray-800">
                  {matchedAttempt?.score}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
        Quiz
      </Text>

      <View className="flex-row items-center px-2 mb-4 flex gap-2">
        {/* Course Dropdown */}
        <View className="flex-1 px-2 bg-white text-black rounded-xl border border-gray-300 w-2/5">
          <Picker
            selectedValue={selectCourse}
            onValueChange={(value) => setSelectCourse(value)}
            style={{ color: "#333", fontFamily: "Nunito-Bold" }}
            dropdownIconColor="#666"
          >
            <Picker.Item
              label="All"
              value="All"
              style={{ color: "black", backgroundColor: colors.WHITE }}
            />
            {allCourses.map((course) => (
              <Picker.Item
                key={course.id}
                label={course.title}
                value={course.title}
                style={{ color: "black", backgroundColor: colors.WHITE }}
              />
            ))}
          </Picker>
        </View>

        {/* Search Box */}
        <View className="relative mr-2 rounded-xl border border-gray-300 w-4/5">
          <TextInput
            className="flex-1 bg-white rounded-xl font-nunito text-black w-full"
            placeholder="Search"
            placeholderTextColor={colors.GRAY}
            value={searchText}
            onChangeText={setSearchText}
            style={{ textAlign: "left", paddingLeft: 50 }} // or "right" if you want it aligned to end
          />
          {searchText !== "" && (
            <Pressable
              className="absolute right-2 z-10 p-2 h-full flex items-center justify-center"
              onPress={() => setSearchText("")}
            >
              <Entypo name="cross" size={20} color="black" />
            </Pressable>
          )}
          <View className="absolute left-2 z-10 p-2 h-full flex items-center justify-center">
            <AntDesign name="search1" size={20} color="black" />
          </View>
        </View>
      </View>

      {filteredQuizzes.length === 0 ? (
        <Text className="text-center text-gray-500 font-nunito-bold">
          No quizzes available.
        </Text>
      ) : (
        <FlatList
          data={filteredQuizzes}
          keyExtractor={(item) => item.id.toString() + item.title}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeScreen>
  );
}
