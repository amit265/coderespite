import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import colors from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SafeScreen({ children }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 16,
    alignItems: "center", // center horizontally
  },
  container: {
    flex: 1,
    width: 600, // max width like a mobile screen
    maxWidth: "100%",
    backgroundColor: colors.BACKGROUND,
    height: "100%"
  },
});
