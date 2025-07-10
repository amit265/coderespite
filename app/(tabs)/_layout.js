import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import colors from "../../constants/colors";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007bff",
          tabBarShowLabel: false,

          tabBarStyle: {
            paddingTop: 8,
            color: "black",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,

            height: 60,
            elevation: 5,
            margin: 10
          },

          tabBarInactiveTintColor: "#6c757d",

          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
              case "index":
                return <AntDesign name="home" size={28} color={color} />;
              case "learn":
                return <AntDesign name="book" size={28} color={color} />;
              case "flashcards":
                return (
                  <MaterialCommunityIcons
                    name="cards-outline"
                    size={28}
                    color={color}
                  />
                );
              case "quiz":
                return (
                  <AntDesign name="questioncircleo" size={28} color={color} />
                );
              case "profile":
                return (
                  <Ionicons
                    name="person-circle-outline"
                    size={28}
                    color={color}
                  />
                );
              default:
                return <AntDesign name="question" size={28} color={color} />;
            }
          },
        })}
      >
        <Tabs.Screen name="learn" options={{ title: "Learn" }} />
        <Tabs.Screen name="flashcards" options={{ title: "Flashcards" }} />
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="quiz" options={{ title: "Quiz" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </View>
  );
}
