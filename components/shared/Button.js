import React, { useRef } from "react";
import { ActivityIndicator, Text, TouchableOpacity, Animated, View, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import colors from "../../constants/colors";

export default function Button({
  text,
  type = "fill",
  onPress,
  loading,
  disable = false,
  backgroundColor = colors.BUTTON,
  color = colors.WHITE,
  variant = "active",
}) {
  const isInactive = disable || variant === "inactive";
  
  // Animation Value: 1 = 100% size
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Safety: If colors.BUTTON is undefined, fallback to Blue (#007bff)
  const safeBackgroundColor = backgroundColor || "#007bff";

  const getBackgroundColor = () => {
    if (isInactive) return colors.BUTTON || "#ccc"; // Fallback for inactive
    return type === "fill" ? safeBackgroundColor : colors.WHITE;
  };

  const getTextColor = () => {
    if (isInactive) return colors.GRAY || "#999";
    return type === "fill" ? color : colors.PRIMARY;
  };

  // --- Animation Handlers ---
  const handlePressIn = () => {
    if (loading || isInactive) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96, // Shrink slightly
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    if (loading || isInactive) return;
    Animated.spring(scaleAnim, {
      toValue: 1, // Bounce back
      friction: 4, 
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onPress) onPress();
  };

  return (
    <Animated.View
      style={{
        width: "100%",
        marginTop: 15,
        transform: [{ scale: scaleAnim }], // apply scale to the wrapper
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading || isInactive}
        activeOpacity={0.9} // Disable default fade since we are scaling
        style={{
          padding: 15,
          width: "100%",
          borderRadius: 15,
          backgroundColor: getBackgroundColor(),
          opacity: isInactive ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          // Add shadow for better visibility
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: type === "fill" && !isInactive ? 0.2 : 0,
          shadowRadius: 3,
          elevation: type === "fill" && !isInactive ? 2 : 0,
        }}
      >
        {!loading ? (
          <Text
            style={{
              textAlign: "center",
              fontSize: 15,
              color: getTextColor(),
              fontFamily: "nunito-bold",
            }}
          >
            {text}
          </Text>
        ) : (
          <ActivityIndicator
            size={"small"}
            color={type === "fill" ? colors.WHITE : colors.PRIMARY}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}