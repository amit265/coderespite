import React from "react";
import { Text, View } from "react-native";

export default function QuickStats({ userData }) {
  const progress = userData?.progress || {};
  console.log("progress", userData?.progress);

  return (
    <View className="flex flex-col gap-4 mt-4 p-4 bg-white rounded-xl">
      <View
        className="border-b border-gray-800 mb-3"
        style={{ borderStyle: "dotted", paddingBottom: 20 }}
      >
        <Text className="text-base font-nunito-bold">📊 Quick Stats:</Text>
      </View>

      <View className="flex flex-row items-start">
        <Text className="text-base font-nunito-bold">📚 Courses Enrolled:</Text>
        <Text className="text-base font-nunito">
          {" "}
          {Object.keys(progress)}
        </Text>
      </View>

      <View className="flex flex-row items-start">
        <Text className="text-base font-nunito-bold">
        💙 Flashcards Loved:
        </Text>
        <Text className="text-base font-nunito">
          {Object.keys(progress).length === 0 ? 0 : ""}
        </Text>
      </View>
      {userData?.progress && (
        <View className="flex flex-col justify-center items-center px-2">
          {Object.entries(progress).map(([courseName, courseData]) => (
            <View key={courseName} className="flex flex-row gap-4">
              <Text className="text-base  ">{courseName}:</Text>
              <Text className="text-base  ">
                {courseData.flashcardsLoved?.length || 0}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View className="flex flex-row items-start">
        <Text className="text-base font-nunito-bold">
          🧠 Flashcards Viewed:
        </Text>
        <Text className="text-base font-nunito">
          {Object.keys(progress).length === 0 ? 0 : ""}
        </Text>
      </View>
      {userData?.progress && (
        <View className="flex flex-col justify-center items-center px-2">
          {Object.entries(progress).map(([courseName, courseData]) => (
            <View key={courseName} className="flex flex-row gap-4">
              <Text className="text-base  ">{courseName}:</Text>
              <Text className="text-base  ">
                {courseData.flashcardsViewed?.length || 0}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View className="flex flex-row items-start flex-wrap">
        <Text className="text-base font-nunito-bold">
          🧪 Quizzes Completed:
        </Text>
        <Text className="text-base font-nunito">
          {Object.keys(progress).length === 0 ? 0 : ""}
        </Text>
      </View>

      {userData?.progress && (
        <View className="flex flex-col justify-center items-center px-2">
          {Object.entries(progress).map(([courseName, courseData]) => (
            <View key={courseName} className="flex flex-row gap-4">
              <Text className="text-base  ">{courseName}:</Text>
              <Text className="text-base  ">
                {courseData.attemptedQuizzes?.length || 0}
              </Text>
            </View>
          ))}
        </View>
      )}
     
    </View>
  );
}
