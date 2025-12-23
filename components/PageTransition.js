import { useFocusEffect } from "expo-router";
import React, { useRef, useCallback } from "react";
import { Animated, View, StyleSheet } from "react-native";

export default function PageTransition({ children }) {
  // Initial values: Invisible and slightly lower (20px down)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      // 1. Reset values instantly when screen comes into focus
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      // 2. Run the animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, // Quick and snappy
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 18, // Bouncy but controlled
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Optional: Cleanup if needed when losing focus
        // fadeAnim.setValue(0); 
      };
    }, [])
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure the animation container fills the space
    width: "100%", 
  },
});