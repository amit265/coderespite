import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ContentPage from "../../../../components/ContentPage";
import PageTransition from "../../../../components/PageTransition";
import SafeScreen from "../../../../components/SafeScreen";
import { allCoursesContext } from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";

export default function LessonScreen() {
  const router = useRouter();
  const { selectedLesson } = useContext(allCoursesContext);

  if (!selectedLesson) {
    return (
      <SafeScreen>
        <Text>No Lesson Selected</Text>
      </SafeScreen>
    );
  }

  return (
    <PageTransition>
      <SafeScreen>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center px-4 mb-4 mt-2">
            <Pressable
              onPress={() => router.back()}
              hitSlop={15}
              className="p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
            <Text
              className="text-xl font-nunito-bold ml-2 flex-1"
              numberOfLines={1}
            >
              {selectedLesson.title}
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="px-4">
              <ContentPage lesson={selectedLesson} />
            </View>
          </ScrollView>
        </View>

        {/* Bottom Banner Ad */}
        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}
