import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

const SplashScreenComponent = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/splashScreen.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.brandingText}>● built by destyastudio.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND || "#CBE7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
  brandingText: {
    position: "absolute",
    bottom: 40,
    fontFamily: "monospace",
    fontSize: 11,
    color: "rgba(12, 29, 89, 0.6)",
    letterSpacing: 1.5,
    textAlign: "center",
  },
});

export default SplashScreenComponent;