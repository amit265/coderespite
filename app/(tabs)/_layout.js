// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          switch (route.name) {
            case 'index':
              iconName = 'home';
              break;
            case 'learn':
              iconName = 'book';
              break;
            case 'flashcards':
              iconName = 'albums';
              break;
            case 'quiz':
              iconName = 'help-circle';
              break;
            case 'profile':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="flashcards" options={{ title: 'Flashcards' }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
