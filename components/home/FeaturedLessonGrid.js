import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import colors from "../../constants/colors";
import { adConfigContext } from "../../context/context";
import Button from "../shared/Button";

export default function FeaturedLessonGrid({ allCourses, setSelectedModule }) {
  const [randomModule, setRandomModule] = useState(null);
  const [courseName, setCourseName] = useState("");
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);

  // console.log("allcourses", allCourses);

  // console.log("randomCourseId", randomModule);

  const defaultModule = {
    title: "Introduction to JavaScript",
    moduleId: "mod01",
  };

  useEffect(() => {
    const allCourseId = allCourses.map((a) => a?.id);

    const randomCourseId =
      allCourseId[Math.floor(Math.random() * allCourseId.length)];
    // console.log("randomCourseId", randomCourseId);
    const randomCourse = allCourses.find((a) => a?.id === randomCourseId);
    // console.log("randomCourse", randomCourse);
    setCourseName(randomCourse?.title || "Featured Course");
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
        console.log("No modules found in the course, using default.");
        setRandomModule(defaultModule);
      }
    } else {
      // If allCourses itself is not valid, still provide fallback
      console.log("No valid courses found, using default.");
      setRandomModule(defaultModule);
    }
  }, [allCourses]);

  if (!randomModule) return null;

  return (
    <TouchableOpacity className="bg-white rounded-xl shadow-md mx-4 mb-4 p-6">
      <Text className="text-xl font-nunito-bold text-black mb-2">
        📚 Featured Lesson
      </Text>
      <Text className="text-lg font-nunito-bold text-gray-600 mb-2">
        🔷 {courseName}
      </Text>
      <Text className="text-base text-gray-600 font-nunito">
        🎯 {randomModule.title}
      </Text>
      <Button
        backgroundColor={colors.PRIMARY}
        color={colors.WHITE}
        text={"Start"}
        onPress={() => {
          if (!randomModule?.moduleId) {
            console.error("No moduleId found for the selected module.");
            return;
          }
          setClickCount((prev) => prev + 1);
          setSelectedModule(randomModule);

          router.push(`/learn/courses/modules/${randomModule?.moduleId}`);
        }}
      />
    </TouchableOpacity>
  );
}
