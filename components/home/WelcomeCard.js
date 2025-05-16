import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text>Hi, Aman</Text>
        <Text>Ready for a quick code break?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: "0.15",
    shadowRadius: 6,
  },
  textContainer: {
    padding: 16,
    
  }
});
