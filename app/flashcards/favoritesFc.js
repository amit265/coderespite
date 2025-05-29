import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Favorites from "../../components/Favorites";
import SafeScreen from "../../components/SafeScreen";
import colors from "../../constants/colors";
import { BannerAdComponent } from "../../services/AdManager";
export default function Index() {
  const router = useRouter();
  return (
    <SafeScreen>
    <View className="relative w-full items-center justify-center pb-4">
            {/* Back Arrow - Positioned on the left */}
            <Pressable
              onPress={() => router.back()}
              className="absolute justify-center items-center left-4"
            >
              <Ionicons name="arrow-back" size={30} color="black" />
            </Pressable>
    
            {/* Title - Centered */}
            <Text
              style={{
                fontSize: 25,
                fontFamily: "nunito-bold",
                color: colors.TEXT,
                textAlign: "center",
              }}
            >
              Favorite Flashcards
            </Text>
          </View>
      <Favorites />
       {/* Bottom Banner Ad */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: 4,
                backgroundColor: colors.BACKGROUND, // Optional: to avoid transparency glitches
              }}
            >
              <BannerAdComponent />
            </View>
    </SafeScreen>
  );
}
