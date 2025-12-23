import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef } from "react";
import { Text, View, Animated } from "react-native";
import { adConfigContext, favoritesContext } from "../context/context";
import FlashCardItem from "./FlashCardItem";
import Button from "./shared/Button";
import PageTransition from "../components/PageTransition";
import SafeScreen from "../components/SafeScreen"

// --- Helper for Empty State Animation ---
const FadeInView = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        width: "100%",
        alignItems: "center",
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function Favorites() {
  const { favorites, setFavorites } = useContext(favoritesContext);
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem("favorites");
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          } else {
            console.warn("Parsed favorites is not an array:", parsed);
          }
        } else {
          console.log("No favorites found in storage.");
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };

    loadData();
  }, []);

  // --- Empty State ---
  if (!favorites || favorites.length === 0) {
    return (
      <PageTransition>
        <SafeScreen>
          <View className="flex-1 justify-center items-center">
            
            {/* Animated Icon or Text */}
            <FadeInView delay={0}>
              <Text style={{ fontSize: 60, marginBottom: 20 }}>💔</Text> 
              <Text className="text-2xl text-center font-nunito-bold text-gray-800 mb-2">
                No favorites yet
              </Text>
              <Text className="text-base text-center text-gray-500 mb-8 px-10">
                Save your favorite flashcards to review them quickly later!
              </Text>
            </FadeInView>

            {/* Animated Button */}
            <FadeInView delay={200}>
              <View className="px-12 w-full">
                <Button
                  text="Explore FlashCards"
                  onPress={() => {
                    setClickCount((prev) => prev + 1);
                    router.push("/(tabs)/flashcards");
                  }}
                />
              </View>
            </FadeInView>

          </View>
        </SafeScreen>
      </PageTransition>
    );
  }

  // --- List State ---
  return (
    <PageTransition>
      <SafeScreen>
         {/* Assuming FlashCardItem renders a list, we wrap it here 
             so it participates in the page transition */}
        <FlashCardItem flashcards={favorites} favorite={"favorite"} />
      </SafeScreen>
    </PageTransition>
  );
}