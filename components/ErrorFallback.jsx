import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Emoji } from "../constants/constants";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Oops! <Emoji>😢</Emoji></Text>
      <Text style={styles.errorText}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={styles.button} onPress={resetErrorBoundary}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ff0000",
  },
  errorText: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ErrorFallback;
