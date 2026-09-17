import { useContext, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Modal, View, Platform, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import JumpBackInCard from "../../components/home/JumpBackInCard";
import DailyChallengeCard from "../../components/home/DailyChallengeCard";
import LevelUpModal from "../../components/LevelUpModal";
import PageTransition from "../../components/PageTransition";
import ProfileModal from "../../components/ProfileModal";
import SafeScreen from "../../components/SafeScreen";
import BadgeModal from "../../components/BadgeModal";
import { checkNewBadges } from "../../services/badgeService";
import {
  allCoursesContext,
  LevelContext,
  userDetailsContext,
  aiCreditsContext,
} from "../../context/context";
import { useGlobalRefresh } from "../../hooks/useGlobalRefresh";
import RefreshWrapper from "../../components/shared/RefreshWrapper"; // 👈 Import Wrapper
import { NativeAdComponent, showRewardedAd } from "../../services/AdManager";
import { getAdFreeRemainingMs, activateAdFree } from "../../services/adFreeService";
import { getAiCredits } from "../../services/aiCreditsService";

// --- Helper Component for Staggered Animation ---
const FadeInSection = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current; // Starts 30px lower

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
        marginBottom: 10, // Adds consistent spacing between sections
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Contexts
  const { userData } = useContext(userDetailsContext);
  const { allCourses, setSelectedModule } = useContext(allCoursesContext);
  const { lastShownLevel, updateLastShownLevel, levelLoading } =
    useContext(LevelContext);
  const { credits: aiCredits, refreshCredits } = useContext(aiCreditsContext);

  const refreshCreditsFromHome = async () => {
    if (refreshCredits) await refreshCredits();
  };

  const router = useRouter();

  // ✨ New Global Refresh Logic
  const { refreshData, refreshing } = useGlobalRefresh();

  useEffect(() => {
    const checkBadges = async () => {
      if (!userData) return;
      const unlocked = await checkNewBadges(userData);
      if (unlocked) {
        setNewBadge(unlocked);
        setShowBadgeModal(true);
      }
    };
    checkBadges();
  }, [userData]);

  useEffect(() => {
    if (!userData) return;
    // Use optional chaining and trim to handle whitespace
    const username = userData?.profile?.name?.trim() ?? "";

    if (username === "user" || username === "") {
      setShowModal(true);
    } else {
      // Optional: Hide the modal if the username becomes valid
      setShowModal(false);
    }
  }, [userData]);

  useEffect(() => {
    if (levelLoading) return;
    const currentLevel = userData?.level?.currentLevel;
    if (!currentLevel) return;

    if (lastShownLevel === currentLevel) return;

    if (currentLevel > lastShownLevel) {
      setShowLevelModal(true);
      updateLastShownLevel(currentLevel);
    }
  }, [userData?.level?.currentLevel]);

  useEffect(() => {
    if (!showModal) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );

    return () => backHandler.remove();
  }, [showModal]);

  const handleCloseModal = () => {
    setShowLevelModal(false);
  };

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header usually stays fixed or animates first */}
        <FadeInSection delay={0}>
          <Header />
        </FadeInSection>

        <RefreshWrapper
          refreshing={refreshing}
          onRefresh={refreshData}
          // Note: contentContainerStyle prop is passed down to the internal ScrollView
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          <FadeInSection delay={100}>
            <WelcomeCard userData={userData} />
          </FadeInSection>

          {/* New Daily Challenge Card */}
          <FadeInSection delay={125}>
            <DailyChallengeCard />
          </FadeInSection>

          <FadeInSection delay={150}>
            <JumpBackInCard />
          </FadeInSection>

          <FadeInSection delay={200}>
            <ContinueCard userData={userData} />
          </FadeInSection>

          {/* Native Ad Component Injected Here */}
          <FadeInSection delay={225}>
            <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 4 }}>
              <NativeAdComponent />
            </View>
          </FadeInSection>

          <FadeInSection delay={250}>
            <TouchableOpacity
              onPress={() => router.push("/interview")}
              className="bg-white mx-4 mb-4 p-6 rounded-2xl shadow-md border border-gray-200 flex-row items-center"
              style={{ gap: 14 }}
            >
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "rgba(19, 47, 148, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(19, 47, 148, 0.3)",
              }}>
                <Text style={{ fontSize: 26 }}>🎤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#1F2937", fontSize: 18, fontFamily: "nunito-bold", marginBottom: 3 }}>
                  Interview Practice AI
                </Text>
                <Text style={{ color: "#4B5563", fontSize: 13, fontFamily: "nunito" }}>
                  Mock interviews and Q&A with Meowgrammer.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </FadeInSection>

          {/* Featured Courses */}
          <FadeInSection delay={300}>
            <FeaturedLessonGrid
              allCourses={allCourses}
              setSelectedModule={setSelectedModule}
            />
          </FadeInSection>

          <FadeInSection delay={400}>
            <QuickActionGrid />
          </FadeInSection>

          <FadeInSection delay={500}>
            <DailyTip />
          </FadeInSection>
        </RefreshWrapper>

        {/* Modals sit on top, no animation wrapper needed */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => {}}
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

        <LevelUpModal
          visible={showLevelModal}
          onClose={handleCloseModal}
          currentLevel={userData?.level?.currentLevel || 1}
        />

        <BadgeModal
          visible={showBadgeModal}
          badge={newBadge}
          onClose={() => setShowBadgeModal(false)}
        />
      </SafeScreen>
    </PageTransition>
  );
}

