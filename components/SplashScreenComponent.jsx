import LottieView from "lottie-react-native";
import React from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import colors from "../constants/colors";
const { width, height } = Dimensions.get("window");

const SplashScreenComponent = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/MainScene.json")}
        autoPlay
        loop = {false}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND || "#fff",
  },
  animation: {
    width,
    height,
  },
});

export default SplashScreenComponent;