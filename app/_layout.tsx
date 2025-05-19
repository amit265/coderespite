// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import './global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar backgroundColor="#CBE7F7" barStyle="dark-content" hidden={true} />
      <Stack screenOptions={{ headerShown: false }} />
    </>


  ); // This will render everything under (tabs) or any other layout
}
