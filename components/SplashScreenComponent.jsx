import LottieView from "lottie-react-native";
import React from "react";
import { useWindowDimensions, StatusBar, StyleSheet, View, Text, Platform } from "react-native";
import colors from "../constants/colors";

const SplashScreenComponent = () => {
  const { width, height } = useWindowDimensions();
  const animWidth = Platform.OS === 'web' ? Math.min(width || 480, 480) : (width || 400);
  const animHeight = Platform.OS === 'web' ? Math.min(height || 850, 850) : (height || 800);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/MainScene.json")}
        autoPlay
        loop={true}
        style={[styles.animation, { width: animWidth, height: animHeight }]}
      />
      <Text style={styles.brandingText}>● built by destyastudio.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND || "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    // Width and height will be set dynamically in render
  },
  brandingText: {
    position: "absolute",
    bottom: 50,
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(12, 29, 89, 0.5)",
    letterSpacing: 1.5,
  },
});

export default SplashScreenComponent;