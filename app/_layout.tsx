// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import './global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar backgroundColor="#F3FAFE" barStyle="dark-content" hidden={false} />
      <Stack screenOptions={{ headerShown: false }} />
    </>


  ); // This will render everything under (tabs) or any other layout
}
