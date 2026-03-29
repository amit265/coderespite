import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Text, View, Animated, Pressable, Easing } from "react-native";
import colors from "../../constants/colors";
import { Emoji, EmojiText } from "../../constants/constants";
import { adConfigContext, allCoursesContext } from "../../context/context";
import Button from "../shared/Button";

export default function FeaturedLessonGrid({ allCourses, setSelectedModule }) {
  const [randomModule, setRandomModule] = useState(null);
  const [randomCourse, setRandomCourse] = useState(null);
  const [courseName, setCourseName] = useState("");
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const { setSelectedCourse } = useContext(allCoursesContext);
  const [loading, setLoading] = useState(false);

  // 1. Animation Refs
  const scaleAnim = useRef(new Animated.Value(1)).current; // For card press
  const pulseAnim = useRef(new Animated.Value(1)).current; // For the "Featured" icon

  const defaultModule = {
    title: "Introduction to JavaScript",
    moduleId: "mod01",
  };

  useEffect(() => {
    // Logic to pick random course (unchanged)
    if (!allCourses || allCourses.length === 0) {
        setRandomModule(defaultModule);
        return;
    }

    const allCourseId = allCourses.map((a) => a?.id);
    const randomCourseId = allCourseId[Math.floor(Math.random() * allCourseId.length)];
    const randomCourse = allCourses.find((a) => a?.id === randomCourseId);

    setRandomCourse(randomCourse || null);
    setCourseName(randomCourse?.title || "");

    if (randomCourse && Array.isArray(randomCourse.modules) && randomCourse.modules.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomCourse.modules.length);
      const selectedModule = randomCourse.modules[randomIndex];
      setRandomModule(selectedModule);
    } else {
      setRandomModule(defaultModule);
    }
  }, [allCourses]);

  // 2. Start the Continuous Pulse Animation
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };
    startPulse();
  }, []);

  // 3. Navigation Logic (Centralized)
  const handleNavigation = () => {
    if (!randomModule?.moduleId && !randomModule?.id) {
      console.error("No moduleId found for the selected module.");
      return;
    }
    
    setLoading(true);
    // Tiny delay to show the "press" animation
    setTimeout(() => {
      if (randomCourse) {
        setSelectedCourse(randomCourse);
      }
      if (randomModule) {
        setSelectedModule(randomModule);
      }
      setClickCount((prev) => prev + 1);
      router.push({
        pathname: `/learn/courses/modules/${randomModule.id}`,
        params: { courseId: randomCourse?.id },
      });
      setLoading(false);
    }, 150);
  };

  // 4. Press Animations
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (!randomModule) return null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handleNavigation}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          marginHorizontal: 16, // mx-4
          marginBottom: 16,     // mb-4
          padding: 24,          // p-6
          // Shadow styles
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
           {/* Animated Icon Wrapper */}
          <Animated.View 
            style={{ 
              marginRight: 8, 
              transform: [{ scale: pulseAnim }],
            }}
          >
            <EmojiText style={{ fontSize: 24, fontFamily: 'nunito-bold', color: 'black' }}>
               📚 Featured Lesson
            </EmojiText>
          </Animated.View>
        </View>

        <EmojiText className="text-lg font-nunito-bold text-gray-600 mb-2">🔷 {courseName}</EmojiText>
        <EmojiText className="text-base text-gray-600 font-nunito mb-6">🎯 {randomModule.title}</EmojiText>

        {/* We disable pointer events on the button so the Pressable parent handles the click.
           This prevents "double click" issues and makes the whole card interactive.
        */}
        <View pointerEvents="none">
            <Button
                backgroundColor={colors.PRIMARY}
                color={colors.WHITE}
                loading={loading}
                text={"Start Learning"}
            />
        </View>
      </Pressable>
    </Animated.View>
  );
}
