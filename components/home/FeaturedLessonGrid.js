import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import colors from "../../constants/colors";
import { adConfigContext } from "../../context/context";
import Button from "../shared/Button";

export default function FeaturedLessonGrid({ allCourses, setSelectedModule }) {
  const [randomModule, setRandomModule] = useState(null);
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const courseName = "JavaScript";
  const randomCourseId = "javascript";

  useEffect(() => {
    if (Array.isArray(allCourses) && allCourses.length > 0) {
      const randomCourse = allCourses.find((a) => a?.id === randomCourseId);

      if (
        randomCourse &&
        Array.isArray(randomCourse.modules) &&
        randomCourse.modules.length > 0
      ) {
        const randomIndex = Math.floor(
          Math.random() * randomCourse.modules.length
        );
        const selectedModule = randomCourse.modules[randomIndex];
        setRandomModule(selectedModule);
      } else {
        console.log("No modules found in the course:");
      }
    }
  }, [allCourses]); // <- listen for data changes!

  if (!randomModule) return null; // or show a loading indicator

  return (
    <TouchableOpacity className="bg-white rounded-xl shadow-md mx-4 mb-4 p-6">
      <Text className="text-xl font-nunito-bold text-gray-800 mb-2">
        📚 Featured Lesson
      </Text>
      <Text className="text-lg font-nunito-bold text-gray-800 mb-2">
        🔷 {courseName}
      </Text>
      <Text className="text-base text-gray-600 font-nunito">
        🎯 {randomModule.title}
      </Text>
      <Button
        backgroundColor={colors.BACKGROUND}
        color={colors.BLACK}
        text={"Start"}
        onPress={() => {
          setClickCount((prev) => prev + 1);
          setSelectedModule(randomModule);
          router.push(`/learn/courses/modules/${randomModule.moduleId}`);
        }}
      />
    </TouchableOpacity>
  );
}
