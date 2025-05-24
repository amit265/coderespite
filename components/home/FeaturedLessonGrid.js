import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import Button from "../shared/Button";
import colors from "../../constants/colors";

export default function FeaturedLessonGrid({ allCourses, setSelectedModule }) {
  const [randomModules, setRandomModules] = useState([]);
  const router = useRouter();
  const courses = allCourses.map((a) => a.id);
  const courseName = "JavaScript"
  const randomCourseId = "javascript";
  console.log("allcourses from feature", allCourses);
  
  const randomCourse = allCourses.find((a) => a?.id === randomCourseId);

  console.log("random course from deature", randomCourse);
  
  useEffect(() => {
    if (
      randomCourse &&
      Array.isArray(randomCourse.modules) &&
      randomCourse.modules.length > 0
    ) {
      const randomIndex = Math.floor(
        Math.random() * randomCourse.modules.length
      );
      const randomModule = randomCourse.modules[randomIndex];
      setRandomModules(randomModule);
      console.log("Random module:", randomModule);
    } else {
      console.log("No modules found for this course.");
    }
  }, []);

  return (
    <TouchableOpacity className="bg-white rounded-xl shadow-md mx-4 mb-4 p-6">
      <Text className="text-xl font-nunito-bold text-gray-800 mb-2">
        📚 Featured Lesson
      </Text>
      <Text className="text-lg font-nunito-bold text-gray-800 mb-2">
      🔷 {courseName}
      </Text>

      <Text className="text-base text-gray-600 font-nunito">
        🎯 {randomModules?.title}
      </Text>
      <Button
        backgroundColor = {colors.BACKGROUND}
        color={colors.BLACK}
        text={"Start"}
        onPress={() => {
          setSelectedModule(randomModules);
          router.push(`/learn/courses/modules/${randomModules?.moduleId}`);
        }}
      />
    </TouchableOpacity>
  );
}
