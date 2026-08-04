import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, View, Text, TouchableOpacity, Modal, StyleSheet, useWindowDimensions, Dimensions } from "react-native";
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarBottom = insets.bottom + (Platform.OS === "ios" ? 10 : 12);
  const tabBarHeight = 64;

  const { width } = useWindowDimensions();
  const tabBarWidth = Math.min(width * 0.95, 400);
  const tabBarLeft = (width - tabBarWidth) / 2;

  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);

  const webTabListener = {
    tabPress: (e) => {
      if (Platform.OS === "web") {
        e.preventDefault(); // Stop tab switch
        setIsDownloadModalVisible(true); // Open the Modal
      }
    },
  };

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
              left: 16,
              right: 16,
              marginHorizontal: 16,
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
        <Tabs.Screen name="learn" options={{ title: "Learn" }} listeners={webTabListener} />
        <Tabs.Screen name="flashcards" options={{ title: "Flashcards" }} listeners={webTabListener} />
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="quiz" options={{ title: "Quiz" }} listeners={webTabListener} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} listeners={webTabListener} />
      </Tabs>

      {/* Floating Action Button (FAB) for Ask Meowgrammer Chat */}
      <TouchableOpacity
        onPress={() => router.push("/chat")}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          bottom: tabBarBottom + tabBarHeight + 20, // Positioned safely above the tab bar
          right: 20,
          backgroundColor: "#8B5CF6", // matching the AI color theme
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
          zIndex: 999, // Ensure it floats above everything
        }}
      >
        <Ionicons name="chatbubbles" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDownloadModalVisible}
        onRequestClose={() => setIsDownloadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unlock Full Experience! 🐾</Text>
            <Text style={styles.modalBody}>
              Get the native mobile app to access the complete learning curriculum, flashcards, quizzes, and tracking tools offline.
            </Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                setIsDownloadModalVisible(false);
                const redirectUrl = "https://destyastudio.com/products/code-respite";
                if (Platform.OS === 'web') {
                  window.open(redirectUrl, "_blank");
                }
              }}
            >
              <Text style={styles.downloadButtonText}>Download App</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDownloadModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    ...(Platform.OS === 'web' && {
      maxWidth: 480,
    }),
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#0C1D59",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#132F94",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  downloadButton: {
    width: "100%",
    backgroundColor: "#FFA500",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  downloadButtonText: {
    color: "#0C1D59",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
});
