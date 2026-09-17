import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef } from "react";
import { Image, Text, View, Animated, Pressable, TouchableOpacity , Alert, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import RefreshWrapper from "../../components/shared/RefreshWrapper";
import { courseIcons } from "../../constants/constants";
import { adConfigContext, allCoursesContext, userDetailsContext } from "../../context/context";
import { useGlobalRefresh } from "../../hooks/useGlobalRefresh";
import { NativeAdComponent } from "../../services/AdManager";
import AsyncStorage from "../../services/storage";
import { CustomAlert } from "../../components/shared/GlobalAlert";

// Calculate dynamic width for 2-column grid
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 16) / 2; // Screen width - horizontal padding (32) - middle gap (16)

// --- New Animated Card Component ---
const AnimatedLearnCard = ({ item, index, onPress, onDelete }) => {
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
        delay: index * 100, // Stagger effect: multiplied by index
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Handlers for the "Click" animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95, // Shrinks slightly
      useNativeDriver: true,
      speed: 20,     // Fast response
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,    // Bounces back to 100%
      friction: 4,   // Low friction = nice bouncy feel
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }], // Controls entrance slide
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginBottom: 24 }}
      >
        <Animated.View
          style={{
            width: CARD_WIDTH,
            height: CARD_WIDTH,
            borderRadius: 24, // Increased radius for a modern look
            overflow: "hidden",
            position: "relative",
            transform: [{ scale: scaleAnim }], // Controls click scale
            // Add subtle shadow
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Image
            source={
              courseIcons[item?.icon] || require("../../assets/default-icon.png")
            }
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />
          {/* Overlay - Aligned to bottom for consistency with Flashcards */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              padding: 16,
              backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker overlay for contrast
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontFamily: "Nunito-Bold",
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

export default function Learn() {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const { allCourses, setSelectedCourse } = useContext(allCoursesContext);
  const { updateCourse, userData, updateUser } = useContext(userDetailsContext);
  const { refreshData, globalRefreshing } = useGlobalRefresh();

  const handleCardPress = (item) => {
    // Add delay so user sees the bounce animation
    setTimeout(() => {
      setClickCount((prev) => prev + 1);
      setSelectedCourse(item);
      updateCourse(item?.title, {});
      router.push(`/learn/courses/${item?.id}`);
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
        <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
          Courses
        </Text>

        <RefreshWrapper
          onRefresh={refreshData}
          refreshing={globalRefreshing}
        >
          <TouchableOpacity
            onPress={() => router.push("/learn/aiRoadmap")}
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
                ⚡️ AI Bespoke Roadmap
              </Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12, fontFamily: "nunito" }}>
                Generate a custom study guide for any goal in 30 seconds!
              </Text>
            </View>
            <Ionicons name="sparkles" size={24} color="white" />
          </TouchableOpacity>

          {allCourses?.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 font-nunito-bold">Pull down to load courses</Text>
            </View>
          ) : (
            <>
              <View style={{ paddingVertical: 16 }}>
                {/* Learning Paths Section */}
              <Text style={{ fontSize: 20, fontFamily: "nunito-bold", marginBottom: 12, paddingHorizontal: 16, color: "#1F2937" }}>
                Curated Learning Paths
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                style={{ paddingBottom: 12 }}
              >
                {[
                  { id: 'web_dev', title: 'Web Developer in 30 Days', desc: 'HTML → CSS → JS → React', courses: ['html', 'css', 'javascript', 'react'], icon: 'globe-outline', color: '#10B981' },
                  { id: 'interview_ready', title: 'Interview Ready', desc: 'DSA → TypeScript', courses: ['dsa', 'typescript'], icon: 'briefcase-outline', color: '#F59E0B' },
                  { id: 'python_master', title: 'Python Master', desc: 'Python for Beginners', courses: ['python'], icon: 'logo-python', color: '#3B82F6' },
                ].map((path) => {
                  const isEnrolled = userData?.profile?.enrolledPath === path.id;
                  
                  return (
                    <TouchableOpacity
                      key={path.id}
                      onPress={async () => {
                        if (!isEnrolled) {
                          if (updateUser) {
                            await updateUser((data) => {
                              if (!data.profile) data.profile = {};
                              data.profile.enrolledPath = path.id;
                              return data;
                            });
                          } else {
                            const { setEnrolledPath } = require('../../services/userStorage');
                            setEnrolledPath(path.id);
                          }
                          CustomAlert.alert("Enrolled!", `You are now enrolled in the ${path.title} path.`);
                        }
                        
                        // Find first course in path
                        const firstCourse = allCourses.find(c => c.id === path.courses[0]);
                        if (firstCourse) {
                          handleCardPress(firstCourse);
                        }
                      }}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 20,
                        padding: 16,
                        width: 260,
                        shadowColor: path.color,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 4,
                        borderTopWidth: 4,
                        borderTopColor: path.color,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ backgroundColor: path.color + '20', padding: 12, borderRadius: 12, marginRight: 12 }}>
                          <Ionicons name={path.icon} size={24} color={path.color} />
                        </View>
                        {isEnrolled && (
                          <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ fontSize: 10, fontFamily: 'nunito-bold', color: '#4B5563', textTransform: 'uppercase' }}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 18, fontFamily: "nunito-bold", color: "#1F2937", marginBottom: 4 }}>{path.title}</Text>
                      <Text style={{ fontSize: 13, fontFamily: "nunito", color: "#6B7280", marginBottom: 16 }}>{path.desc}</Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
                        <Text style={{ fontSize: 12, fontFamily: "nunito-bold", color: path.color }}>
                          {isEnrolled ? "Continue Path" : "Enroll Now"}
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color={path.color} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

              <Text style={{ fontSize: 20, fontFamily: "nunito-bold", marginBottom: 16, paddingHorizontal: 16, color: "#1F2937" }}>
                All Courses
              </Text>
              {/* Default Courses Section */}
              <View 
                style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                }}
              >
                {allCourses.filter(c => !c?.id?.toString().startsWith("AI_")).map((item, index) => (
                  <AnimatedLearnCard
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
                    Your Custom Roadmaps
                  </Text>
                  <View 
                    style={{ 
                      flexDirection: 'row', 
                      flexWrap: 'wrap', 
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                    }}
                  >
                    {allCourses.filter(c => c?.id?.toString().startsWith("AI_")).map((item, index) => (
                      <AnimatedLearnCard
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
            </>
          )}
        </RefreshWrapper>
      </SafeScreen>
    </PageTransition>
  );
}
