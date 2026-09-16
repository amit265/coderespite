import { useRouter } from "expo-router";
import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Modal, ScrollView, Text, View, Animated, Platform, TouchableOpacity } from "react-native";
import ProgressBar from "../../components/home/ProgressBar";
import PageTransition from "../../components/PageTransition";
import ProfileModal from "../../components/ProfileModal";
import QuickStats from "../../components/QuickStats";
import SafeScreen from "../../components/SafeScreen";
import Button from "../../components/shared/Button";
import UserCard from "../../components/UserCard";
import StreakHeatmap from "../../components/StreakHeatmap";
import { generateLastNDaysData } from "../../services/generateLastNDaysData";
import { userDetailsContext } from "../../context/context";
import { uploadAllData } from "../../services/uploadData";
import { clearAllData, logAllAsyncStorage } from "../../services/userStorage";

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
  const { userData } = useContext(userDetailsContext);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const show = false; // Dev toggle

  const heatmapData = useMemo(() => generateLastNDaysData(userData?.progress, userData?.activityLog), [userData?.progress, userData?.activityLog]);

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
          {/* 1. Title */}
          <FadeInSection delay={0}>
            <View>
              <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
                Profile
              </Text>
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
              
              <TouchableOpacity
                onPress={() => {
                  const { showRewardedAd } = require("../../services/AdManager");
                  const { addStreakFreeze } = require("../../services/userStorage");
                  const { Alert } = require("react-native");
                  
                  // Optional: Show loading state here if we wanted
                  showRewardedAd(
                    async () => {
                      await addStreakFreeze(1);
                      if (updateUser) {
                        updateUser(prev => {
                          if (!prev.streak) prev.streak = { currentStreak: 0, freezes: 0 };
                          prev.streak.freezes = (prev.streak.freezes || 0) + 1;
                          return { ...prev };
                        });
                      }
                      Alert.alert("Reward Earned! ❄️", "You've earned 1 Streak Freeze! This will automatically protect your streak if you miss a day.");
                    },
                    () => {}
                  );
                }}
                style={{
                  marginTop: 16,
                  backgroundColor: "#EFF6FF",
                  padding: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#BFDBFE"
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>📺</Text>
                <Text style={{ fontFamily: "nunito-bold", color: "#1D4ED8" }}>Watch Ad to Earn a Freeze ❄️</Text>
              </TouchableOpacity>
            </View>
          </FadeInSection>

          {/* 4. Stats Grid */}
          <FadeInSection delay={300}>
            <View className="px-4">
              <QuickStats userData={userData} />
            </View>
          </FadeInSection>

          {/* Dev Tools (Conditionally Rendered) */}
          {show && (
            <View>
              <FadeInSection delay={400}>
                <View className="px-4">
                  <Button text={"Clear all data"} type onPress={clearAllData} />
                </View>
              </FadeInSection>
              <FadeInSection delay={450}>
                 <View className="px-4">
                  <Button text={"log all data"} type onPress={logAllAsyncStorage} />
                </View>
              </FadeInSection>
               <FadeInSection delay={500}>
                <View className="px-4">
                  <Button text={"upload all data"} type onPress={uploadAllData} />
                </View>
              </FadeInSection>
            </View>
          )}

          {/* 5. Action Buttons */}
          <FadeInSection delay={350}>
            <View className="px-4 mt-2">
              <Button
                text={"Badges & Achievements 🏆"}
                type
                onPress={() => router.push("/badges")}
              />
            </View>
          </FadeInSection>

          <FadeInSection delay={400}>
            <View className="px-4 mt-4">
              <Button
                text={"Quiz History"}
                type
                onPress={() => router.push("/quizHistory")}
              />
            </View>
          </FadeInSection>

          <FadeInSection delay={500}>
            <View className="px-4" style={{ marginBottom: 20 }}>
              <Button
                text={"Favorite FlashCards"}
                type
                onPress={() => router.push("/flashcards/favoritesFc")}
              />
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