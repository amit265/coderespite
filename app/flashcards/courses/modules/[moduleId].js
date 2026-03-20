import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { Pressable, View } from "react-native";
import FlashCardItem from "../../../../components/FlashCardItem";
import PageTransition from "../../../../components/PageTransition";
import SafeScreen from "../../../../components/SafeScreen";
import { allCoursesContext } from "../../../../context/context";
import { BannerAdComponent } from "../../../../services/AdManager";

export default function FlashcardList() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const { allCourses, selectedModule, setSelectedModule } = useContext(allCoursesContext);

  const module = useMemo(() => {
    if (selectedModule && selectedModule.id === moduleId) return selectedModule;
    
    // Fallback search
    for (const course of allCourses) {
      const found = course.modules?.find(m => m.id === moduleId);
      if (found) return found;
    }
    return null;
  }, [selectedModule, moduleId, allCourses]);

  useEffect(() => {
    if (module && (!selectedModule || selectedModule.id !== module.id)) {
        setSelectedModule(module);
    }
  }, [module]);

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

  return (
    <PageTransition>
      <SafeScreen>
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
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
          </View>

          <View style={{ flex: 1 }}>
            <FlashCardItem flashcards={flashcards} />
          </View>
        </View>

        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}
