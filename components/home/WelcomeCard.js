import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={{}}>Hi, Aman</Text>
        <Text>Ready for a quick code break?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  textContainer: {
    padding: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
