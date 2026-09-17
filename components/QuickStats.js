import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { allCoursesContext } from "../context/context";

export default function QuickStats({ userData }) {
  const progress = userData?.progress || {};
  const { allCourses } = useContext(allCoursesContext);
  const [aiQuizCount, setAiQuizCount] = useState(0);

  useEffect(() => {
    const loadAiQuizzes = async () => {
      try {
        const stored = await AsyncStorage.getItem("@attemptedQuiz_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setAiQuizCount(parsed.length);
          }
        }
      } catch (err) {
        console.error("Failed to load AI quiz count for QuickStats:", err);
      }
    };
    loadAiQuizzes();
  }, []);

  const progressEntries = Object.entries(progress).filter(
    ([courseName, courseData]) => courseData && typeof courseData === "object"
  );

  const getStatCount = (courseData, statKey) => {
    return courseData[statKey]?.length || 0;
  };

  const totalEnrolled = progressEntries.length || 0;
  const totalLoved = progressEntries.reduce((total, course) => total + getStatCount(course[1], "flashcardsLoved"), 0);
  const totalViewed = progressEntries.reduce((total, course) => total + getStatCount(course[1], "flashcardsViewed"), 0);
  const courseQuizzes = progressEntries.reduce((total, course) => total + getStatCount(course[1], "attemptedQuizzes"), 0);
  const totalQuizzes = courseQuizzes + aiQuizCount;

  const stats = [
    { label: "Enrolled Courses", value: totalEnrolled, icon: "library", color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Quizzes Taken", value: totalQuizzes, icon: "flask", color: "#10B981", bg: "#ECFDF5" },
    { label: "Cards Viewed", value: totalViewed, icon: "albums", color: "#8B5CF6", bg: "#F5F3FF" },
    { label: "Favorite Cards", value: totalLoved, icon: "star", color: "#F59E0B", bg: "#FFFBEB" },
  ];

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: 'quicksand-bold', fontSize: 16, color: '#1F2937', marginBottom: 12, marginLeft: 4 }}>
        📊 Quick Stats
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {stats.map((s, i) => (
          <View key={i} style={{
            width: '48%',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            shadowColor: s.color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <Text style={{ fontFamily: 'quicksand-bold', fontSize: 22, color: '#1F2937', marginBottom: 2 }}>
              {s.value}
            </Text>
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, color: '#6B7280' }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
