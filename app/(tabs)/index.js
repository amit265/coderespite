import { useContext, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Modal, View, Platform } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import LevelUpModal from "../../components/LevelUpModal";
import PageTransition from "../../components/PageTransition";
import ProfileModal from "../../components/ProfileModal";
import SafeScreen from "../../components/SafeScreen";
import {
  allCoursesContext,
  LevelContext,
  userDetailsContext,
} from "../../context/context";
import { useGlobalRefresh } from "../../hooks/useGlobalRefresh";
import RefreshWrapper from "../../components/shared/RefreshWrapper"; // 👈 Import Wrapper

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

  // Contexts
  const { userData } = useContext(userDetailsContext);
  const { allCourses, setSelectedModule } = useContext(allCoursesContext);
  const { lastShownLevel, updateLastShownLevel, levelLoading } =
    useContext(LevelContext);

  // ✨ New Global Refresh Logic
  const { refreshData, refreshing } = useGlobalRefresh();

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

          <FadeInSection delay={200}>
            <ContinueCard userData={userData} />
          </FadeInSection>

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
      </SafeScreen>
    </PageTransition>
  );
}
