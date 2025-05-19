import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarShowLabel: false,

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
  );
}
