import React from "react";
import { ScrollView, View } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import ProgressSummary from "../../components/home/ProgressSummary";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import SafeScreen from "../../components/SafeScreen";

export default function Home() {
  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator = {false}>
          <Header />
          <WelcomeCard />
          <ContinueCard />
          <ProgressSummary />
          <QuickActionGrid />
          <FeaturedLessonGrid />
          <DailyTip />
      </ScrollView>
    </SafeScreen>
  );
}
