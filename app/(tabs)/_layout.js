import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarShowLabel: false,
        // tabBarActiveBackgroundColor: "#F3FAFE",
        
        tabBarIcon: ({ color, size,focused }) => {
          let iconName: any = "home";
          switch (route.name) {
            case "index":
              iconName = "home";
              break;
            case "learn":
              iconName = "book-outline";
              break;
            case "flashcards":
              iconName = "card-outline";
              break;
            case "quiz":
              iconName = "help-circle";
              break;
            case "profile":
              iconName = "person-circle-outline";
              break;
          }
          const iconSize = focused ? 32 : 24; // 👈 Selected tab icon bigger

          return <Ionicons name={iconName} size={iconSize} color={color} />;
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
