import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../constants/colors";

// --- Custom Animated Icon Component ---
const TabIcon = ({ focused, icon, tabBarHeight }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <Animated.View
      style={{
        width: "100%",
        height: tabBarHeight,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: scaleAnim }],
      }}
    >
      {icon}
    </Animated.View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = insets.bottom + (Platform.OS === "ios" ? 10 : 12);
  const tabBarHeight = 64;

  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "#6c757d",
          tabBarShowLabel: false,

          tabBarStyle: {
            position: "absolute",
            bottom: tabBarBottom,
            left: 10,
            right: 10,
            height: tabBarHeight,
            paddingTop: 0,
            paddingBottom: 0,
            borderRadius: 20,
            backgroundColor: "white",
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            marginHorizontal: 10,
            elevation: 5,
          },
          tabBarIconStyle: {
            marginTop: 15
          },
          tabBarItemStyle: {
            height: tabBarHeight,
            paddingTop: 0,
            paddingBottom: 0,
            alignItems: "center",
            justifyContent: "center",
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
                tabBarHeight={tabBarHeight}
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
