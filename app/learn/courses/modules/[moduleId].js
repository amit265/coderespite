import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeScreen from "../../../../components/SafeScreen";
import Button from "../../../../components/shared/Button";
import colors from "../../../../constants/colors";
import { courseIcons, getQuizFeedback } from "../../../../constants/constants";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../../../context/context";

export default function ModuleId() {
  const { courseId, moduleId } = useLocalSearchParams();
  console.log("moduleId", moduleId);
  console.log("courseId", courseId);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [selectedModule, setSelectedModule] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState([]);
  const { allCourses, setSelectedQuiz, setSelectedLesson } =
    useContext(allCoursesContext);
  const { userData } = useContext(userDetailsContext);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [moduleQuizStatus, setModuleQuizStatus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const [showModal, setShowModal] = useState(false);
  // const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    // Find the selected
    //  course based on courseId
    const selectedCourse = allCourses.find((course) => course.id === courseId);
    setSelectedCourse(selectedCourse);

    // Find the selected module based on moduleId
    const selectedModule = selectedCourse?.modules?.find(
      (module) => module.id === moduleId
    );
    setSelectedModule(selectedModule);

    // If no module is found, set selectedModule to null
    const selectedQuizId = `quiz_${selectedModule?.id}`;
    setSelectedQuizId(selectedQuizId);
  }, [courseId, moduleId, allCourses]);

  useEffect(() => {
    if (selectedCourse && selectedQuizId) {
      const selectedQuiz = selectedCourse?.quizzes?.find(
        (quiz) => quiz.id === selectedQuizId
      );
      setSelectedQuiz(selectedQuiz);
      console.log("selectedQuiz", selectedQuiz);
    }
  }, [selectedCourse, selectedQuizId, setSelectedQuiz]);

  useEffect(() => {
    const progress = userData?.progress;
    const allAttemptedQuizzes = Object.values(progress || {}).flatMap(
      (course) => course.attemptedQuizzes || []
    );

    const filterCourse = allAttemptedQuizzes.filter(
      (a) => a.courseId === selectedCourse?.id
    );

    const filterModule = filterCourse.find(
      (a) => a.moduleId === selectedModule?.id
    );

    setModuleQuizStatus(filterModule);
  }, [selectedCourse, selectedModule, userData, selectedQuizId]);

  console.log("moduleQuizStatus", moduleQuizStatus);
  // Generate feedback based on the module quiz status
  // This will run whenever moduleQuizStatus changes

  useEffect(() => {
    const feedback = getQuizFeedback(moduleQuizStatus?.score);
    setFeedback(feedback);
  }, [moduleQuizStatus]);

  console.log("feedack, feed", feedback);

  const toggleLesson = (lesson) => {
    // setShowModal(true);
    setSelectedLesson(lesson);

    router.push("/learn/courses/modules/lesson");
    // setExpandedLessons((prev) => ({
    //   ...prev,
    //   [lessonId]: !prev[lessonId],
    // }));
  };

  if (!selectedCourse || !selectedModule) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-lg font-nunito">
          Module not found.
        </Text>
      </View>
    );
  }

  return (
    <SafeScreen>
      <View
        className="flex flex-row gap-2 py-2 px-2"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
        <Text
          className="text-2xl font-nunito-bold mb-2 text-black"
          numberOfLines={1}
        >
          {selectedCourse?.title} Module
        </Text>
      </View>

      <ScrollView
        className="flex"
        style={{ backgroundColor: colors.BACKGROUND }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row gap-4 p-4">
          <View style={{ width: 150, height: 150 }}>
            <Image
              source={
                courseIcons[selectedCourse?.icon] ||
                require("../../../../assets/default-icon.png")
              }
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 20,
              }}
            />
            {moduleQuizStatus && (
              <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                <MaterialCommunityIcons
                  name="checkbox-marked-circle"
                  size={24}
                  color={
                    moduleQuizStatus?.score > 70 ? "#AAFF00" : "transparent"
                  }
                />
              </View>
            )}
          </View>
          <View className="flex-1 gap-2 justify-center">
            <Text
              className="text-black text-lg font-nunito-bold"
              numberOfLines={3}
            >
              {selectedModule?.title}
            </Text>
            <Text className="text-sm font-nunito text-gray-700">
              Level: {selectedModule?.level}
            </Text>
            <View className="flex flex-row justify-between items-center gap-1 mt-1">
              <View className="flex flex-row items-center gap-1">
                <AntDesign name="book" size={16} color="gray" />
                <Text className="text-sm font-nunito text-gray-700">
                  {selectedModule?.lessons?.length} Lessons
                </Text>
              </View>
              {moduleQuizStatus && (
                <View className="flex flex-row items-end gap-2">
                  <FontAwesome
                    name={moduleQuizStatus?.score > 70 ? "star" : "star-o"}
                    size={16}
                    color={
                      moduleQuizStatus?.score > 70 ? "#AAFF00" : "#FF0000"
                    }
                  />
                  <Text className="text-sm font-nunito text-gray-700">
                    {moduleQuizStatus?.score}%
                  </Text>
                </View>
              )}  
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-sm font-nunito text-gray-700 text-justify">
            {selectedModule?.description}
          </Text>
        </View>

        <View style={{ marginBottom: 60 }}>
          {selectedModule?.lessons?.map((lesson, index) => {
            const isExpanded = expandedLessons[lesson.lessonId];
            return (
              <TouchableOpacity
                key={lesson.lessonId}
                className="mb-4"
                onPress={() => toggleLesson(lesson)}
                activeOpacity={0.9}
              >
                <View className="py-4 border border-gray-300 rounded-lg bg-gray-50">
                  <View className="flex flex-row justify-between items-center">
                    <Text
                      className="text-base font-nunito text-black px-6 py-2"
                      style={{ paddingRight: 40 }}
                    >
                      {index + 1}. {lesson.title}
                    </Text>
                    {/* <View className="absolute right-4 justify-center items-center">
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="black"
                      />
                    </View> */}
                  </View>

                  {isExpanded && (
                    <>
                      {lesson.type === "theory" && (
                        <Text className="text-gray-600 font-nunito px-6 text-justify text-sm">
                          {lesson.content}
                        </Text>
                      )}
                      {lesson.type === "code" && (
                        <View className="bg-gray-900 rounded mt-2">
                          <Text className="text-green-400 font-nunito px-6 py-3 text-sm">
                            {lesson.content}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* <ContentModal
            showModal={showModal}
            setShowModal={setShowModal}
            lesson={selectedLesson}
          /> */}
        </View>

        {feedback && (
          <View
            className="px-6 py-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200"
            style={{ marginBottom: 120 }}
          >
            <Text className="text-xl font-nunito-bold text-black mb-3">
              {feedback.title}
            </Text>

            <Text className="text-base text-gray-600 mb-6 font-nunito">
              {feedback.message}
              {feedback.highlight ? (
                <Text className="text-green-600 font-nunito">
                  {feedback.highlight}
                </Text>
              ) : null}
              {feedback.emoji}
            </Text>

            {moduleQuizStatus && (
              <View>
                <Text className="text-base text-gray-600 mb-6 font-nunito">
                  Your last score: {moduleQuizStatus?.score}
                </Text>
              </View>
            )}

            <Button
              text={moduleQuizStatus ? "Retake Test" : "Start Test"}
              onPress={() => {
                setClickCount((prev) => prev + 1);
                router.push(`/quiz/courses/${selectedQuizId}`);
              }}
            />
          </View>
        )}
      </ScrollView>

  
    </SafeScreen>
  );
}
