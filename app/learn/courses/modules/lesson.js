import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import ContentPage from "../../../../components/ContentPage";
import SafeScreen from "../../../../components/SafeScreen";
import colors from "../../../../constants/colors";
import { allCoursesContext } from "../../../../context/context";
export default function Lesson() {
  const { selectedLesson, selectedQuiz } = useContext(allCoursesContext);
  const router = useRouter();
  console.log("selectedquiz", selectedQuiz);

  return (
    <SafeScreen>
      <View
        className="flex flex-row w-full justify-start px-2 mb-4"
        style={{ gap: 8 }}
      >
        {/* Back Arrow - Positioned on the left */}
        <Pressable
          onPress={() => router.back()}
          className="justify-center items-center"
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>

        {/* Title - Centered */}
        <Text
          style={{
            fontFamily: "nunito-bold",
            color: colors.TEXT,
            textAlign: "left",
          }}
          numberOfLines={1}
          className="text-lg"
        >
          {selectedLesson?.title || "Lesson Title"}
        </Text>
      </View>

      <ContentPage selectedLesson={selectedLesson} />
   
    </SafeScreen>
  );
}
