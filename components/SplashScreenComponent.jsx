import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import colors from "../constants/colors";
import Lottie from "lottie-react";
import mainScene from "../assets/MainScene.json";
const { width, height } = Dimensions.get("window");

const SplashScreenComponent = () => {
  return (
    <View style={styles.container}>
      <Lottie
        animationData={mainScene}
        autoPlay
        loop={false}
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
