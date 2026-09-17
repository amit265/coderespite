import { useRouter } from "expo-router";
import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Modal, ScrollView, Text, View, Animated, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "../../components/home/ProgressBar";
import PageTransition from "../../components/PageTransition";
import ProfileModal from "../../components/ProfileModal";
import QuickStats from "../../components/QuickStats";
import SafeScreen from "../../components/SafeScreen";
import UserCard from "../../components/UserCard";
import StreakHeatmap from "../../components/StreakHeatmap";
import PowerUps from "../../components/PowerUps";
import { generateLastNDaysData } from "../../services/generateLastNDaysData";
import { userDetailsContext, aiCreditsContext, allCoursesContext } from "../../context/context";
import { CustomAlert } from "../../components/shared/GlobalAlert";
// --- Helper for Staggered Animation ---
const FadeInSection = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: 8, // Consistent spacing
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function Profile() {
  const { userData, updateUser } = useContext(userDetailsContext);
  const { allCourses, setSelectedCourse } = useContext(allCoursesContext);
  const { credits: aiCredits, setCredits: setAiCredits, refreshCredits } = useContext(aiCreditsContext);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const heatmapData = useMemo(() => generateLastNDaysData(userData?.progress, userData?.activityLog), [userData?.progress, userData?.activityLog]);

  const activeCourses = useMemo(() => {
    if (!userData?.progress || !allCourses) return [];
    const enrolledKeys = Object.keys(userData.progress).filter(
      key => userData.progress[key] && typeof userData.progress[key] === "object"
    );
    return allCourses.filter(course => enrolledKeys.includes(course.title));
  }, [userData?.progress, allCourses]);

  useEffect(() => {
    const username = userData?.profile?.name ?? ""; 
    if (username === "user" || username === "") {
      setShowModal(true);
    }
  }, [userData]); 

  return (
    <PageTransition>
      <SafeScreen>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }} // Added padding for floating tabs
        >
          {/* 1. Title & Settings */}
          <FadeInSection delay={0}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
              <View style={{ width: 32 }} />
              <Text className="text-2xl font-quicksand-bold text-black text-center">
                Profile
              </Text>
              <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={15}>
                <Ionicons name="settings-sharp" size={26} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </FadeInSection>

          {/* 2. User Card */}
          <FadeInSection delay={100}>
            <View className="px-4">
              <UserCard userData={userData} setShowModal={setShowModal} />
            </View>
          </FadeInSection>

          {/* 3. Level Progress */}
          <FadeInSection delay={200}>
            <View className="px-4 bg-white mx-4 rounded-lg mt-4 pb-4 shadow-sm">
              <ProgressBar />
            </View>
          </FadeInSection>

          {/* Streak Heatmap */}
          <FadeInSection delay={250}>
            <View className="px-4 bg-white mx-4 rounded-lg mt-4 p-4 shadow-sm">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontFamily: "nunito-bold", color: "#000" }}>🔥 Activity Streak</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontFamily: "nunito-bold", color: "#3B82F6", marginRight: 4 }}>
                    {userData?.streak?.freezes || 0}
                  </Text>
                  <Text style={{ fontSize: 14 }}>❄️</Text>
                </View>
              </View>
              <StreakHeatmap data={heatmapData} />
            </View>
          </FadeInSection>

          {/* AI Credits & Power Ups */}
          <FadeInSection delay={280}>
            <View className="px-4 mt-2">
              <PowerUps credits={aiCredits} refreshCredits={refreshCredits} />
            </View>
          </FadeInSection>

          {/* 4. Stats Grid */}
          <FadeInSection delay={300}>
            <View className="px-4">
              <QuickStats userData={userData} />
            </View>
          </FadeInSection>

          {/* Active Courses */}
          {activeCourses.length > 0 && (
            <FadeInSection delay={320}>
              <View style={styles.menuContainer}>
                <Text style={styles.menuTitle}>Active Learning Paths & Courses</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                  style={{ marginTop: 4, paddingBottom: 8 }}
                >
                  {activeCourses.map((course) => {
                    const progressData = userData.progress[course.title];
                    const completedPercentage = progressData?.percentage || 0;
                    
                    return (
                      <TouchableOpacity
                        key={course.id}
                        onPress={() => {
                          if (setSelectedCourse) setSelectedCourse(course);
                          router.push(`/learn/courses/${course.id}`);
                        }}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 16,
                          padding: 16,
                          width: 220,
                          borderWidth: 1,
                          borderColor: '#F3F4F6',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={{ backgroundColor: '#EEF2FF', padding: 10, borderRadius: 10, marginRight: 10 }}>
                            <Ionicons name="book" size={20} color="#6366F1" />
                          </View>
                          <Text style={{ fontSize: 16, fontFamily: "nunito-bold", color: "#1F2937", flex: 1 }} numberOfLines={1}>
                            {course.title}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 12, fontFamily: "nunito", color: "#6B7280" }}>Progress</Text>
                          <Text style={{ fontSize: 12, fontFamily: "nunito-bold", color: "#6366F1" }}>{Math.round(completedPercentage)}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#E0E7FF', borderRadius: 3, overflow: 'hidden' }}>
                          <View style={{ width: `${Math.min(completedPercentage, 100)}%`, height: '100%', backgroundColor: '#6366F1', borderRadius: 3 }} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </FadeInSection>
          )}

          {/* 5. Action Menu */}
          <FadeInSection delay={350}>
            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>Learning & Achievements</Text>
              <View style={styles.menuCard}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/badges")} activeOpacity={0.7}>
                  <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="trophy" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.menuItemText}>Badges & Achievements</Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/quizHistory")} activeOpacity={0.7}>
                  <View style={[styles.menuIconWrap, { backgroundColor: '#E0E7FF' }]}>
                    <Ionicons name="list" size={20} color="#6366F1" />
                  </View>
                  <Text style={styles.menuItemText}>Quiz History</Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => router.push("/flashcards/favoritesFc")} activeOpacity={0.7}>
                  <View style={[styles.menuIconWrap, { backgroundColor: '#FCE7F3' }]}>
                    <Ionicons name="star" size={20} color="#EC4899" />
                  </View>
                  <Text style={styles.menuItemText}>Favorite Flashcards</Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>
            </View>
          </FadeInSection>

          {/* Profile Setup Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
                width: "100%",
                alignSelf: "center",
                ...(Platform.OS === 'web' && {
                  maxWidth: 480,
                }),
              }}
            >
              <View
                style={{
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 10,
                  padding: 20,
                }}
              >
                <ProfileModal setShowModal={setShowModal} />
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  menuTitle: {
    fontFamily: 'quicksand-bold',
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    color: '#374151',
  }
});