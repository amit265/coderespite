import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef } from "react";
import { Image, Text, View, Animated, Pressable, TouchableOpacity , Alert, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PageTransition from "../components/PageTransition";
import SafeScreen from "../components/SafeScreen";
import RefreshWrapper from "../components/shared/RefreshWrapper";
import { flashcardIcons } from "../constants/constants";
import { adConfigContext, allCoursesContext, userDetailsContext } from "../context/context";
import { useGlobalRefresh } from "../hooks/useGlobalRefresh";
import { NativeAdComponent } from "../services/AdManager";
import AsyncStorage from "../services/storage";
import { CustomAlert } from "../components/shared/GlobalAlert";

// Calculate dynamic width for 2-column grid
// Removed Dimensions requirement as we will use flex percentages

// --- Animated Card Component ---
const AnimatedCard = ({ item, index, onPress, onDelete }) => {
  // 1. Entrance Animations (Slide Up & Fade In)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // 2. Interaction Animation (Scale on Press)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Run entrance animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Handlers for the "Click" animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92, // Shrinks to 92% size
      useNativeDriver: true,
      speed: 20,     // Fast response
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,    // Bounces back to 100%
      friction: 4,   // Low friction = extra bouncy
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }], // Controls the entrance slide
        width: '47.5%',
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginBottom: 24 }} // Move margin here for layout consistency
      >
        <Animated.View
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            transform: [{ scale: scaleAnim }], // Controls the click scale
          }}
        >
          <Image
            source={
              flashcardIcons[item?.icon] || require("../assets/default-icon.png")
            }
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              borderRadius: 20,
            }}
          />
          {/* Overlay */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              padding: 16, // p-4
              backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker overlay for better text contrast
              borderRadius: 20,
              justifyContent: "flex-end", // Align text to bottom looks cleaner
            }}
          >
            <Text 
              style={{ 
                color: "white", 
                fontSize: 18, 
                fontWeight: "700", // Bold
                fontFamily: "Nunito-Bold" // Ensure font matches your system
              }}
            >
              {item.title}
            </Text>
          </View>
          {item?.id?.toString().startsWith("AI_") && onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "rgba(220, 38, 38, 0.9)", // red-600 with opacity
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function FlashCards() {
  const router = useRouter();
  const { allCourses, setSelectedCourse } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);
  const { updateCourse } = useContext(userDetailsContext);
  const { refreshData, globalRefreshing } = useGlobalRefresh();

  const handleCardPress = (item) => {
    // We add a tiny delay to allow the "bounce" animation to be seen before navigating
    setTimeout(() => {
        setSelectedCourse(item);
        updateCourse(item?.title, {});
        setClickCount((prev) => prev + 1);
        router.push(`/flashcards/courses/${item?.id}`);
    }, 150);
  };

  const handleDeleteCourse = (course) => {
    CustomAlert.alert(
      "Delete Course",
      `Are you sure you want to delete "${course.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const storedCustom = await AsyncStorage.getItem("@custom_ai_courses");
              if (storedCustom) {
                const customCourses = JSON.parse(storedCustom);
                const updatedCourses = customCourses.filter(c => c.id !== course.id);
                await AsyncStorage.setItem("@custom_ai_courses", JSON.stringify(updatedCourses));
                
                // Also clean up progress
                const storedUser = await AsyncStorage.getItem("@user_data");
                if (storedUser) {
                  const userData = JSON.parse(storedUser);
                  if (userData.progress && userData.progress[course.title]) {
                    delete userData.progress[course.title];
                    await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
                  }
                }
                
                refreshData(false); // Refresh UI
              }
            } catch (err) {
              console.error("Error deleting course", err);
            }
          }
        }
      ]
    );
  };

  return (
    <PageTransition>
      <SafeScreen>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, marginTop: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontFamily: "nunito-bold", color: "black", marginLeft: 16 }}>
            FlashCards
          </Text>
        </View>

        <RefreshWrapper
          onRefresh={refreshData}
          refreshing={globalRefreshing}
        >
          <TouchableOpacity
            onPress={() => router.push("/flashcards/reviewFc")}
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 20,
              padding: 16,
              marginHorizontal: 16,
              marginBottom: 10,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "nunito-bold", marginBottom: 4 }}>
                🧠 Spaced Repetition Review
              </Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12, fontFamily: "nunito" }}>
                Review due flashcards using the smart Leitner box system.
              </Text>
            </View>
            <Ionicons name="repeat" size={24} color="white" />
          </TouchableOpacity>

          {allCourses?.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 font-nunito-bold">Pull down to load flashcards</Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {/* Default Courses Section */}
              <View 
                style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  justifyContent: 'space-between',
                  paddingTop: 10
                }}
              >
                {allCourses.filter(c => !c?.id?.toString().startsWith("AI_")).map((item, index) => (
                  <AnimatedCard
                    key={item.id}
                    item={item}
                    index={index}
                    onPress={() => handleCardPress(item)}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </View>

              {/* AI Courses Section */}
              {allCourses.some(c => c?.id?.toString().startsWith("AI_")) && (
                <>
                  <Text style={{ fontSize: 20, fontFamily: "nunito-bold", marginTop: 24, marginBottom: 16, color: "#1F2937" }}>
                    Your Custom Flashcards
                  </Text>
                  <View 
                    style={{ 
                      flexDirection: 'row', 
                      flexWrap: 'wrap', 
                      justifyContent: 'space-between',
                    }}
                  >
                    {allCourses.filter(c => c?.id?.toString().startsWith("AI_")).map((item, index) => (
                      <AnimatedCard
                        key={item.id}
                        item={item}
                        index={index}
                        onPress={() => handleCardPress(item)}
                        onDelete={handleDeleteCourse}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </RefreshWrapper>
      </SafeScreen>
    </PageTransition>
  );
}
