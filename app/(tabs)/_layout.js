import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../constants/colors";

// --- Custom Animated Icon Component ---
const TabIcon = ({ focused, icon, color, size }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // Animation when active: Scale up, move up, fade in dot
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: -5, // Moves icon slightly up
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation when inactive: Reset to normal
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
        }}
      >
        {icon}
      </Animated.View>
      {/* The floating dot indicator */}
      <Animated.View style={[styles.activeDot, { opacity: opacityAnim, backgroundColor: color }]} />
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "#6c757d",
          tabBarShowLabel: false,

          tabBarStyle: {
            position: "absolute", // Ensures it floats over content
            bottom: Platform.OS === "ios" ? insets.bottom || 10 : 10,
            left: 10,
            right: 10,
            height: 65,
            borderRadius: 20,
            backgroundColor: "white",
            borderTopWidth: 0, // Remove default top border
            
            // Shadows for iOS
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            marginHorizontal: 10,
            // Shadows for Android
            elevation: 5,
            
            paddingTop: 15, // Reset padding to center icons
          },

          tabBarIcon: ({ color, size, focused }) => {
            let iconComponent;

            // Define icons based on route
            switch (route.name) {
              case "index":
                iconComponent = <AntDesign name="home" size={24} color={color} />;
                break;
              case "learn":
                iconComponent = <AntDesign name="book" size={24} color={color} />;
                break;
              case "flashcards":
                iconComponent = (
                  <MaterialCommunityIcons
                    name="cards-outline"
                    size={26}
                    color={color}
                  />
                );
                break;
              case "quiz":
                iconComponent = (
                  <AntDesign name="questioncircleo" size={24} color={color} />
                );
                break;
              case "profile":
                iconComponent = (
                  <Ionicons
                    name="person-circle-outline"
                    size={26}
                    color={color}
                  />
                );
                break;
              default:
                iconComponent = <AntDesign name="question" size={24} color={color} />;
            }

            // Return the animated wrapper
            return (
              <TabIcon
                focused={focused}
                icon={iconComponent}
                color={color}
                size={size}
              />
            );
          },
        })}
      >
        {/* Reordered slightly to keep Home (index) in the logical center if you prefer, 
            but keeping your original order works too. */}
        <Tabs.Screen name="learn" options={{ title: "Learn" }} />
        <Tabs.Screen name="flashcards" options={{ title: "Flashcards" }} />
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="quiz" options={{ title: "Quiz" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: 50, // Ensure touch target is large enough
  },
  activeDot: {
    position: "absolute",
    bottom: 8, // Positioned near the bottom of the tab bar
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});