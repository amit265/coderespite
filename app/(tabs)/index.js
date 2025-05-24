import React, { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import ProgressBar from "../../components/home/ProgressBar";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import ProfileModal from "../../components/ProfileModal";
import SafeScreen from "../../components/SafeScreen";
import { allCoursesContext, userDetailsContext } from "../../context/context";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const { userData } = useContext(userDetailsContext);
  const { update, setUpdate } = useContext(allCoursesContext);

  useEffect(() => {
    if (!userData) setUpdate(!update);
    console.log("useeffect called");
    console.log("update", update);
  }, []);

  useEffect(() => {
    const firstTime = userData?.profile?.firstTime;
    const timeout = setTimeout(() => {
      if (firstTime) setShowModal(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [userData]);

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <WelcomeCard userData={userData} />
        <ContinueCard userData={userData} />
        <FeaturedLessonGrid />

        {/* <ProgressSummary /> */}
        <QuickActionGrid />
        <DailyTip />
        <ProgressBar />
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
  );
}
