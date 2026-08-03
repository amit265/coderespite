import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

export default function SafeScreen({ children }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingHorizontal: 8,
  },
  container: {
    flex: 1,
  },
});
