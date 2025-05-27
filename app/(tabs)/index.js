import React, { useContext, useEffect, useState } from "react";
import { BackHandler, Modal, ScrollView, View } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import LevelUpModal from "../../components/LevelUpModal";
import ProfileModal from "../../components/ProfileModal";
import SafeScreen from "../../components/SafeScreen";
import {
  allCoursesContext,
  LevelContext,
  userDetailsContext,
} from "../../context/context";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const { userData } = useContext(userDetailsContext);
  const { allCourses, setSelectedModule } = useContext(allCoursesContext);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const { lastShownLevel, updateLastShownLevel, levelLoading } =
    useContext(LevelContext);

  useEffect(() => {
    const username = userData?.profile?.name;
    if (username === "user") {
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    if (levelLoading) return;
    const currentLevel = userData?.level?.currentLevel;
    if (!currentLevel) return;

    // If already shown for this level, don't show again
    if (lastShownLevel === currentLevel) return;

    // Show modal only if level increased
    if (lastShownLevel === null || currentLevel > lastShownLevel) {
      setShowLevelModal(true);
      updateLastShownLevel(currentLevel);
    }
  }, [userData?.level?.currentLevel]);

  const handleCloseModal = () => {
    setShowLevelModal(false);
  };

  useEffect(() => {
    if (!showModal) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Block back press when modal is open
        return true;
      }
    );

    return () => backHandler.remove();
  }, [showModal]);

  return (
    <SafeScreen>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <WelcomeCard userData={userData} />
        <ContinueCard userData={userData} />
        <FeaturedLessonGrid
          allCourses={allCourses}
          setSelectedModule={setSelectedModule}
        />

        {/* <ProgressSummary /> */}
        <QuickActionGrid />
        <DailyTip />
      </ScrollView>
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
  );
}
