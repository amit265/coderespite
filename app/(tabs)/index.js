import React from "react";
import { StyleSheet, View } from "react-native";
import ContinueCard from "../../components/home/ContinueCard";
import DailyTip from "../../components/home/DailyTip";
import FeaturedLessonGrid from "../../components/home/FeaturedLessonGrid";
import Header from "../../components/home/Header";
import ProgressSummary from "../../components/home/ProgressSummary";
import QuickActionGrid from "../../components/home/QuickActionGrid";
import WelcomeCard from "../../components/home/WelcomeCard";
import colors from "../../constants/colors";

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <View style={styles.content}>
        <WelcomeCard />
        <ContinueCard />
        <ProgressSummary />
        <QuickActionGrid />
        <FeaturedLessonGrid />
        <DailyTip />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.BACKGROUND,
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
});
