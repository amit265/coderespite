import React from "react";
import { ScrollView, View } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import ProgressSummary from "../../components/home/ProgressSummary";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-[#f8f9fa]">
      <View className="flex-1 space-y-4 pb-16">
        <Header />
        <WelcomeCard />
        <ContinueCard />
        <ProgressSummary />
        <QuickActionGrid />
        <FeaturedLessonGrid />
        <DailyTip />
      </View>
    </ScrollView>
  );
}
