// app/_layout.tsx
import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />; // This will render everything under (tabs) or any other layout
}
