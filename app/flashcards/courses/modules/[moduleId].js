import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import FlashCardItem from "../../../../components/FlashCardItem";
import PageTransition from "../../../../components/PageTransition";
import SafeScreen from "../../../../components/SafeScreen";
import colors from "../../../../constants/colors";
import { allCoursesContext } from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";

export default function FlashcardList() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const { allCourses, selectedCourse, selectedModule, setSelectedCourse, setSelectedModule } =
    useContext(allCoursesContext);

  const resolvedCourse = useMemo(() => {
    if (selectedCourse?.modules?.some((item) => item.id === moduleId)) {
      return selectedCourse;
    }

    return allCourses.find((course) =>
      course.modules?.some((item) => item.id === moduleId)
    );
  }, [allCourses, moduleId, selectedCourse]);

  const module = useMemo(() => {
    if (selectedModule && selectedModule.id === moduleId) return selectedModule;

    for (const course of allCourses) {
      const found = course.modules?.find((m) => m.id === moduleId);
      if (found) return found;
    }
    return null;
  }, [selectedModule, moduleId, allCourses]);

  useEffect(() => {
    if (module && (!selectedModule || selectedModule.id !== module.id)) {
      setSelectedModule(module);
    }
    if (resolvedCourse && resolvedCourse.id !== selectedCourse?.id) {
      setSelectedCourse(resolvedCourse);
    }
  }, [module, resolvedCourse, selectedCourse, selectedModule, setSelectedCourse, setSelectedModule]);

  if (!module) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
           <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeScreen>
    );
  }

  const flashcards = module.flashcards || [];
  const moduleTitle = module?.title || "Flashcards";
  const courseTitle = resolvedCourse?.title || "";

  return (
    <PageTransition>
      <SafeScreen>
        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 16,
              marginTop: 8,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={15}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "nunito-bold",
                  fontSize: 20,
                  color: colors.BLACK,
                }}
                numberOfLines={1}
              >
                {moduleTitle}
              </Text>
              <Text
                style={{
                  fontFamily: "nunito",
                  fontSize: 13,
                  color: colors.GRAY,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {flashcards.length} flashcards
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <FlashCardItem
              flashcards={flashcards}
              title={moduleTitle}
              courseTitle={courseTitle}
            />
          </View>
        </View>

        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}
