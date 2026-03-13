import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Favorites from "../../components/Favorites";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import { BannerAdComponent } from "../../services/AdManager";

export default function FavoritesFc() {
  const router = useRouter();

  return (
    <PageTransition>
      <SafeScreen>
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={15}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          </View>

          <View style={{ flex: 1 }}>
            <Favorites />
          </View>
        </View>

        <BannerAdComponent fixed={true} />
      </SafeScreen>
    </PageTransition>
  );
}
