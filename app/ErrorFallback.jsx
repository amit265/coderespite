import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Emoji, EmojiText } from '../constants/constants';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <View style={styles.container}>
      <EmojiText style={styles.errorText}>Something went wrong 😢</EmojiText>
      <Text style={styles.message}>{error.message}</Text>
      <Button title="Try Again" onPress={resetErrorBoundary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    fontFamily: "nunito-bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    fontFamily: "nunito"
  },
});

export default ErrorFallback;
