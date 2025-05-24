import React, { useContext, useEffect, useState } from "react";
import { BackHandler, Modal, ScrollView, View } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import ProfileModal from "../../components/ProfileModal";
import SafeScreen from "../../components/SafeScreen";
import { allCoursesContext, userDetailsContext } from "../../context/context";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const { userData } = useContext(userDetailsContext);
  const { allCourses, setSelectedModule } = useContext(allCoursesContext);

  useEffect(() => {
    const firstTime = userData?.profile?.firstTime;
    const name = userData?.profile?.name;
    if (firstTime || name === "user") setShowModal(true);
  }, [userData]);

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />

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
    </SafeScreen>
  );
}
